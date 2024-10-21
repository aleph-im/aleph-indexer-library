import {
  AccountIndexerConfigWithMeta,
  IndexableEntityType,
  IndexerDomainContext,
  ParserContext,
} from '@aleph-indexer/framework'
import {
  SolanaParsedInstructionContext,
  TOKEN_PROGRAM_ID,
} from '@aleph-indexer/solana'
import {
  createSPLTokenEventDAL,
  SPLTokenEventDALIndex,
} from '../../dal/solana/splTokenEvent.js'
import {
  SPLTokenAccountMeta,
  SPLTokenEventType,
  SPLTokenAccountType,
  SPLTokenEvent,
  SPLTokenBalance,
  SPLTokenEventInitializeAccount,
  SPLTokenEventCloseAccount,
} from '../../types/solana.js'
import {
  createSPLTokenBalanceDAL,
  SPLTokenBalanceDALIndex,
} from '../../dal/solana/splTokenBalance.js'
import {
  CommonBalance,
  BlockchainWorkerI,
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
  CommonEvent,
} from '../../types/common.js'
import { SolanaEventParser } from '../parser/solana.js'
import {
  eventHasMissingOwner,
  getMintFromInstructionContext,
  getOwnerFromEventAccount,
} from '../../utils/solana.js'
import { blockchainTokenContract } from '../../utils/constants.js'
import { PendingWork, PendingWorkStorage, Utils } from '@aleph-indexer/core'
import { createSPLTokenTrackAccountDAL } from '../../dal/solana/splTokenTrackAccount.js'
import { getCommonBalances, getCommonEvents } from '../../utils/query.js'

export default class SolanaWorkerDomain implements BlockchainWorkerI {
  constructor(
    protected context: IndexerDomainContext,
    protected splTokenTrackAccountDAL = createSPLTokenTrackAccountDAL(
      context.dataPath,
    ),
    protected splTokenEventDAL = createSPLTokenEventDAL(context.dataPath),
    protected splTokenBalanceDAL = createSPLTokenBalanceDAL(context.dataPath),
    protected parser = new SolanaEventParser(splTokenEventDAL),
    protected programId = TOKEN_PROGRAM_ID,
    protected processTrackedAccounts: Utils.PendingWorkPool<void>,
    protected processMissingOwners: Utils.PendingWorkPool<void>,
  ) {
    this.processTrackedAccounts = new Utils.PendingWorkPool<void>({
      id: `process-tracked-accounts`,
      interval: 0,
      chunkSize: 1000,
      concurrency: 1,
      dal: new PendingWorkStorage({
        name: 'process-tracked-accounts',
        path: context.dataPath,
      }),
      handleWork: this.handleProcessTrackedAccounts.bind(this),
      checkComplete: () => true,
    })

    this.processMissingOwners = new Utils.PendingWorkPool<void>({
      id: `process-missing-owners`,
      interval: 1000 * 60 * 5,
      chunkSize: 1000,
      concurrency: 1,
      dal: new PendingWorkStorage({
        name: 'process-missing-owners',
        path: context.dataPath,
      }),
      handleWork: this.handleMissingOwnerAccounts.bind(this),
      checkComplete: this.checkCompleteMissingOwnerAccounts.bind(this),
    })
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<SPLTokenAccountMeta>,
  ): Promise<void> {
    const { meta } = config
    console.log(`Indexing ${meta.type}`, JSON.stringify(config))

    // @note: Run in background to let the API to initialize
    Promise.all([
      this.initMissingOwners(config),
      this.initTrackedAccounts(config),
    ]).catch(console.log)
  }

  async filterEntity(
    context: ParserContext,
    entity: SolanaParsedInstructionContext,
  ): Promise<boolean> {
    const { blockchainId } = context

    const mint = await getMintFromInstructionContext(
      blockchainId,
      entity,
      this.splTokenEventDAL,
    )

    return mint === blockchainTokenContract[blockchainId]
    // return mint === 'CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K'
  }

  async indexEntities(
    context: ParserContext,
    entities: SolanaParsedInstructionContext[],
  ): Promise<void> {
    const { blockchainId } = context
    console.log(`Index ${blockchainId} ixs`, JSON.stringify(entities, null, 2))

    // const { account } = context
    // const mintAccount = blockchainTokenContract[blockchainId]
    // const isMintAccount = mintAccount === account

    const trackAccountsSet: Set<string> = new Set()
    const missingOwnerSet: Set<string> = new Set()
    const parsedEvents: SPLTokenEvent[] = []
    const parsedBalances: SPLTokenBalance[] = []

    // @note: Parsing events

    for (const entity of entities) {
      const parsedEvent = await this.parser.parseEvent(blockchainId, entity)
      if (!parsedEvent) continue
      parsedEvents.push(parsedEvent)

      const parsedBalance = this.parser.parseBalanceFromEvent(parsedEvent)
      parsedBalances.push(...parsedBalance)

      const missingOwner = eventHasMissingOwner(parsedEvent)
      if (missingOwner) {
        missingOwnerSet.add(parsedEvent.id)
      }

      switch (parsedEvent.type) {
        case SPLTokenEventType.InitializeAccount:
        case SPLTokenEventType.CloseAccount: {
          const { blockchain, mint, account } = parsedEvent
          trackAccountsSet.add(`${blockchain}_${mint}_${account}`)
          break
        }
      }
    }

    if (parsedEvents.length) {
      await this.splTokenEventDAL.save(parsedEvents)
    }

    if (parsedBalances.length) {
      await this.splTokenBalanceDAL.save(parsedBalances)
    }

    if (missingOwnerSet.size) {
      const time = Date.now()
      const payload = undefined

      const works = [...missingOwnerSet].map((id) => ({
        id: `${id}&${time}`,
        time,
        payload,
      }))

      await this.processMissingOwners.addWork(works)
    }

    if (trackAccountsSet.size) {
      const time = Date.now()
      const payload = undefined

      const works = [...trackAccountsSet].map((id) => ({
        id: `${id}&${time}`,
        time,
        payload,
      }))

      await this.processTrackedAccounts.addWork(works)
    }
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<CommonBalance[]> {
    return getCommonBalances(
      args,
      this.splTokenBalanceDAL,
      SPLTokenBalanceDALIndex,
    )
  }

  async getEvents(args: CommonEventQueryArgs): Promise<CommonEvent[]> {
    return getCommonEvents(args, this.splTokenEventDAL, SPLTokenEventDALIndex)
  }

  protected async handleMissingOwnerAccounts(
    works: PendingWork<void>[],
  ): Promise<void> {
    const dedupWorks = [...new Set(works.map((w) => w.id.split('&')[0]))]

    try {
      const updateEvents = []
      const updateBalances = []

      for (const id of dedupWorks) {
        console.log('🎾 Solana missing owner event', id)

        const event = await this.splTokenEventDAL.get(id)
        if (!event) continue

        const newEvent = { ...event }
        let update = false

        if (!event.owner) {
          newEvent.owner = await getOwnerFromEventAccount(
            newEvent.blockchain,
            newEvent.account,
            this.splTokenEventDAL,
          )
          update = update || !!newEvent.owner
        }

        if (newEvent.type === SPLTokenEventType.Transfer && !newEvent.toOwner) {
          newEvent.toOwner = await getOwnerFromEventAccount(
            newEvent.blockchain,
            newEvent.toAccount,
            this.splTokenEventDAL,
          )
          update = update || !!newEvent.toOwner
        }

        if (
          newEvent.type === SPLTokenEventType.Approve &&
          !newEvent.delegateOwner
        ) {
          newEvent.delegateOwner = await getOwnerFromEventAccount(
            newEvent.blockchain,
            newEvent.delegate,
            this.splTokenEventDAL,
          )
          update = update || !!newEvent.delegateOwner
        }

        if (!update) continue

        console.log('🎾 Solana missing owner UPDATE', id)
        updateEvents.push(newEvent)

        const parsedBalance = this.parser.parseBalanceFromEvent(newEvent)
        updateBalances.push(...parsedBalance)
      }

      await this.splTokenEventDAL.save(updateEvents)
      await this.splTokenBalanceDAL.save(updateBalances)
    } catch (e) {
      console.log(e)
    }
  }

  protected async checkCompleteMissingOwnerAccounts(
    work: PendingWork<void>,
  ): Promise<boolean> {
    const id = work.id.split('&')[0]

    const event = await this.splTokenEventDAL.get(id)
    if (!event) return true

    return !eventHasMissingOwner(event)
  }

  protected async handleProcessTrackedAccounts(
    works: PendingWork<void>[],
  ): Promise<void> {
    const dedupWorks = [...new Set(works.map((w) => w.id.split('&')[0]))].map(
      (id) => id.split('_'),
    )

    try {
      for (const [blockchain, mint, account] of dedupWorks) {
        console.log('🎾 Solana Process tracked account', blockchain, account)

        const trackedAccount =
          await this.splTokenTrackAccountDAL.getFirstValueFromTo(
            [blockchain, account],
            [blockchain, account],
          )

        if (!trackedAccount) {
          await this.indexAccount(blockchain, mint, account)
          continue
        }

        if (trackedAccount.completeHeight !== undefined) {
          const newEvent = await this.splTokenEventDAL
            .useIndex(SPLTokenEventDALIndex.BlockchainAccountHeightIndex)
            .getFirstValueFromTo(
              [blockchain, account, trackedAccount.completeHeight + 1],
              [blockchain, account, undefined],
            )

          if (newEvent) {
            console.log(
              '🎾 Solana 0 re-index ',
              account,
              newEvent.height,
              trackedAccount.completeHeight,
              newEvent.height > trackedAccount.completeHeight,
            )

            await this.indexAccount(blockchain, mint, account)
            continue
          }
          console.log(
            '🎾 Solana 1 account complete',
            account,
            trackedAccount.completeHeight,
          )

          continue
        }

        // @note: From here check if the tracked account can be mark as complete

        const accountState = await this.context.apiClient
          .useBlockchain(blockchain)
          .getAccountState({ account, type: IndexableEntityType.Transaction })

        console.log('🎾 Solana 2 Account state', account, accountState)

        if (!accountState) continue

        const { completeHistory, pending } = accountState
        if (!completeHistory || pending.length) continue

        const entries = await this.splTokenEventDAL
          .useIndex(SPLTokenEventDALIndex.BlockchainAccountHeightIndex)
          .getAllValuesFromTo([blockchain, account], [blockchain, account], {
            reverse: false,
          })

        const lastState: {
          event?: SPLTokenEventInitializeAccount | SPLTokenEventCloseAccount
          valid: boolean
        } = {
          event: undefined,
          valid: false,
        }

        for await (const event of entries) {
          const { type } = event

          if (
            type !== SPLTokenEventType.InitializeAccount &&
            type !== SPLTokenEventType.CloseAccount
          )
            continue

          const lastEvent = lastState.event
          lastState.event = event
          if (!lastEvent) continue

          lastState.valid =
            lastEvent.height <= event.height &&
            ((lastEvent.type === SPLTokenEventType.InitializeAccount &&
              event.type === SPLTokenEventType.CloseAccount) ||
              (lastEvent.type === SPLTokenEventType.CloseAccount &&
                event.type === SPLTokenEventType.InitializeAccount))

          console.log('🎾 Solana 3 Account state update', account, lastState)

          if (!lastState.valid) break
        }

        if (!lastState.valid) continue
        if (lastState.event?.type !== SPLTokenEventType.CloseAccount) continue

        await this.context.apiClient.useBlockchain(blockchain).deleteAccount({
          account,
          partitionKey: mint,
          index: { transactions: true },
        })

        console.log('🎾 Solana 4 Remove account track', account)

        await this.splTokenTrackAccountDAL.save({
          blockchain,
          mint,
          account,
          completeHeight: lastState.event.height,
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  protected async initMissingOwners(
    config: AccountIndexerConfigWithMeta<SPLTokenAccountMeta>,
  ): Promise<void> {
    const { blockchainId: blockchain, account, meta } = config
    const { type } = meta

    if (type !== SPLTokenAccountType.Mint) return

    const allEvents = await this.splTokenEventDAL
      .useIndex(SPLTokenEventDALIndex.BlockchainTimestampIndex)
      .getAllValuesFromTo([blockchain], [blockchain])

    console.log('🏀 initMissingOwners START', account)

    const works = []

    for await (const entry of allEvents) {
      const missingOwner = eventHasMissingOwner(entry)
      if (!missingOwner) continue

      const id = entry.id
      const time = Date.now()
      const payload = undefined

      works.push({
        id: `${id}&${time}`,
        time,
        payload,
      })
    }

    await this.processMissingOwners.addWork(works)
    await this.processMissingOwners.start()

    console.log('🏀 initMissingOwners END', account)

    return
  }

  protected async initTrackedAccounts(
    config: AccountIndexerConfigWithMeta<SPLTokenAccountMeta>,
  ): Promise<void> {
    const { blockchainId: blockchain, account, meta } = config
    const { type } = meta

    if (type === SPLTokenAccountType.Mint) {
      const mint = account

      const trackedAccounts =
        await this.splTokenTrackAccountDAL.getAllValuesFromTo(
          [blockchain],
          [blockchain],
        )

      console.log('🍕 initTrackedAccounts START', account)

      const works = []

      for await (const entry of trackedAccounts) {
        const { account, completeHeight } = entry
        if (completeHeight !== undefined) continue

        await this.indexAccount(blockchain, mint, account)

        const id = `${blockchain}_${mint}_${account}`
        const time = Date.now()
        const payload = undefined

        works.push({
          id: `${id}&${time}`,
          time,
          payload,
        })
      }

      await this.processTrackedAccounts.addWork(works)
      await this.processTrackedAccounts.start()

      console.log('🍕 initTrackedAccounts END', account)

      return
    }

    if (type === SPLTokenAccountType.Account) {
      const { mint } = meta

      await this.splTokenTrackAccountDAL.save({
        blockchain,
        mint,
        account,
      })

      console.log('🍕🍕 Solana', account)
    }

    return
  }

  protected async indexAccount(
    blockchain: string,
    mint: string,
    account: string,
  ): Promise<void> {
    await this.context.apiClient.useBlockchain(blockchain).indexAccount({
      account,
      partitionKey: mint,
      index: { transactions: true },
      meta: {
        type: SPLTokenAccountType.Account,
        mint,
      },
    } as any)
  }
}
