import {
  AccountIndexerConfigWithMeta,
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
  SPLTokenBalanceQueryArgs,
  SPLTokenEventQueryArgs,
} from '../../types/solana.js'
import {
  createSPLTokenBalanceDAL,
  SPLTokenBalanceDALIndex,
} from '../../dal/solana/splTokenBalance.js'
import {
  Balance,
  BlockchainWorkerI,
  CommonBalanceQueryArgs,
} from '../../types/common.js'
import { SolanaEventParser } from '../parser/solana.js'
import { getMintFromInstructionContext } from '../../utils/solana.js'
import { blockchainTokenContract } from '../../utils/constants.js'
import { Utils } from '@aleph-indexer/core'
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
    protected processInitAccounts: Utils.BufferExec<string>,
    protected processCloseAccounts: Utils.BufferExec<string>,
    protected parser = new SolanaEventParser(splTokenEventDAL),
    protected programId = TOKEN_PROGRAM_ID,
  ) {
    this.processInitAccounts = new Utils.BufferExec<string>(
      this.handleInitAccounts.bind(this),
      10,
      1000 * 30,
    )

    this.processCloseAccounts = new Utils.BufferExec<string>(
      this.handleCloseAccounts.bind(this),
      10,
      1000 * 30,
    )
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<SPLTokenAccountMeta>,
  ): Promise<void> {
    const { blockchainId: blockchain, account, meta } = config

    console.log(`Indexing ${meta.type}`, JSON.stringify(config))

    if (meta.type === SPLTokenAccountType.Mint) {
      const mint = account

      const trackedAccounts =
        await this.splTokenTrackAccountDAL.getAllValuesFromTo(
          [blockchain],
          [blockchain],
        )

      for await (const entry of trackedAccounts) {
        const { account } = entry
        console.log('🟢', account)

        // @note: don't block the indexing, just notify there should be a new calculation
        this.processInitAccounts
          .add(`${blockchain}:${mint}:${account}`)
          .catch(() => 'ignore')
      }

      return
    }

    if (meta.type === SPLTokenAccountType.Account) {
      const { mint } = meta

      await this.splTokenTrackAccountDAL.save({ blockchain, mint, account })

      return
    }
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

    // @note: hack fro fast parsing mint in the next step
    ;(entity.instruction as any)._mint = mint

    return mint === blockchainTokenContract[blockchainId]
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

    const initAccounts: string[] = []
    const closeAccounts: string[] = []
    const parsedEvents: SPLTokenEvent[] = []
    const parsedBalances: SPLTokenBalance[] = []

    // @note: Parsing events

    for (const entity of entities) {
      const parsedEvent = await this.parser.parseEvent(blockchainId, entity)
      if (!parsedEvent) continue

      parsedEvents.push(parsedEvent)

      const parsedBalance = this.parser.parseBalanceFromEvent(parsedEvent)
      parsedBalances.push(...parsedBalance)

      switch (parsedEvent.type) {
        case SPLTokenEventType.InitializeAccount:
        case SPLTokenEventType.InitializeMint: {
          const { blockchain, mint, account } = parsedEvent
          initAccounts.push(`${blockchain}:${mint}:${account}`)
          break
        }
        case SPLTokenEventType.CloseAccount: {
          const { blockchain, mint, account } = parsedEvent
          closeAccounts.push(`${blockchain}:${mint}:${account}`)
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

    if (initAccounts.length) {
      // @note: don't block the indexing, just notify there should be a new calculation
      this.processInitAccounts.add(initAccounts).catch(() => 'ignore')
    }

    if (closeAccounts.length) {
      // @note: don't block the indexing, just notify there should be a new calculation
      this.processCloseAccounts.add(closeAccounts).catch(() => 'ignore')
    }
  }

  getBalances(args: SPLTokenBalanceQueryArgs): Promise<Balance[]> {
    return getCommonBalances(
      args,
      this.splTokenBalanceDAL,
      SPLTokenBalanceDALIndex,
    )
  }

  async getEvents(args: SPLTokenEventQueryArgs): Promise<SPLTokenEvent[]> {
    return getCommonEvents(args, this.splTokenEventDAL, SPLTokenEventDALIndex)
  }

  protected async handleInitAccounts(accounts: string[]): Promise<void> {
    const uniqueAccounts = [...new Set(accounts)]

    try {
      for (const bcAccount of uniqueAccounts) {
        const [blockchain, mint, account] = bcAccount.split(':')

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
    } catch (e) {
      console.log(e)
    }
  }

  protected async handleCloseAccounts(accounts: string[]): Promise<void> {
    // const uniqueAccounts = [...new Set(accounts)]
    // try {
    //   for (const bcAccount of uniqueAccounts) {
    //     const [blockchain, mint, account] = bcAccount.split(':')
    //     await this.context.apiClient.useBlockchain(blockchain).deleteAccount({
    //       account,
    //       partitionKey: mint,
    //       index: { transactions: false },
    //     })
    //   }
    // } catch (e) {
    //   console.log(e)
    // }
  }
}
