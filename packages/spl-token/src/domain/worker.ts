import { PendingWork, PendingWorkPool, Blockchain } from '@aleph-indexer/core'
import {
  AccountIndexerConfigWithMeta,
  createStatsStateDAL,
  createStatsTimeSeriesDAL,
  IndexerDomainContext,
  IndexerWorkerDomain,
  SolanaIndexerWorkerDomainI,
  SolanaInstructionContextV1,
} from '@aleph-indexer/framework'
import {
  createEventParser,
  EventParser as eventParser,
} from '../parsers/event.js'
import { mintParser as mParser } from '../parsers/mint.js'
import { createEventDAL } from '../dal/event.js'
import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenAccount,
  SPLTokenEvent,
  SPLTokenEventType,
  SPLTokenType,
} from '../types.js'
import { Mint } from './mint.js'
import { TOKEN_PROGRAM_ID } from '../constants.js'
import {
  getBalanceFromEvent,
  getEventAccounts,
  isSPLTokenInstruction,
} from '../utils/utils.js'
import { createFetchMintDAL } from '../dal/fetchMint.js'
import {
  AccountHoldingsFilters,
  MintAccount,
  MintEventsFilters,
  TokenHoldersFilters,
} from './types.js'
import { createBalanceHistoryDAL } from '../dal/balanceHistory.js'
import { createBalanceStateDAL } from '../dal/balanceState.js'
import { createAccountMintDAL } from '../dal/accountMints.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements SolanaIndexerWorkerDomainI
{
  public mints: Record<string, Mint> = {}
  public accountMints: PendingWorkPool<MintAccount>

  constructor(
    protected context: IndexerDomainContext,
    protected eventParser: eventParser,
    protected mintParser = mParser,
    protected eventDAL = createEventDAL(context.dataPath),
    protected statsStateDAL = createStatsStateDAL(context.dataPath),
    protected statsTimeSeriesDAL = createStatsTimeSeriesDAL(context.dataPath),
    protected fetchMintDAL = createFetchMintDAL(context.dataPath),
    protected balanceHistoryDAL = createBalanceHistoryDAL(context.dataPath),
    protected balanceStateDAL = createBalanceStateDAL(context.dataPath),
    protected accountMintDAL = createAccountMintDAL(context.dataPath),
    protected programId = TOKEN_PROGRAM_ID,
  ) {
    super(context)
    this.eventParser = createEventParser(this.fetchMintDAL, this.eventDAL)
    this.accountMints = new PendingWorkPool<MintAccount>({
      id: 'mintAccounts',
      interval: 0,
      chunkSize: 100,
      concurrency: 1,
      dal: this.fetchMintDAL,
      handleWork: this._handleMintAccounts.bind(this),
      checkComplete: () => false,
    })
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<SPLTokenAccount>,
  ): Promise<void> {
    const { account, meta } = config

    if (
      meta.type === SPLTokenType.Mint ||
      meta.type === SPLTokenType.Account ||
      meta.type === SPLTokenType.AccountMint
    ) {
      const mint = meta.mint
      if (!this.mints[mint]) {
        this.mints[mint] = new Mint(
          mint,
          this.eventDAL,
          this.balanceStateDAL,
          this.balanceHistoryDAL,
          this.accountMintDAL,
        )
      }
      await this.mints[mint].addAccount(account)
    }
    console.log('Account indexing', this.context.instanceName, account)
  }

  async getMintEvents(
    account: string,
    filters: MintEventsFilters,
  ): Promise<SPLTokenEvent[]> {
    const mint = this.mints[account]
    if (!mint) return []
    return await mint.getEvents(filters)
  }

  async getTokenHolders(
    account: string,
    filters: TokenHoldersFilters,
  ): Promise<SPLAccountBalance[]> {
    const mint = this.mints[account]
    if (!mint) return []
    return await mint.getTokenHolders(filters)
  }

  async getAccountHoldings(
    account: string,
    filters: AccountHoldingsFilters,
  ): Promise<SPLAccountHoldings[]> {
    const mint = this.mints[account]
    if (!mint) return []
    return await mint.getTokenHoldings(filters)
  }

  async solanaFilterInstructions(
    ixsContext: SolanaInstructionContextV1[],
  ): Promise<SolanaInstructionContextV1[]> {
    return ixsContext.filter(({ ix }) => isSPLTokenInstruction(ix))
  }

  async solanaIndexInstructions(
    ixsContext: SolanaInstructionContextV1[],
  ): Promise<void> {
    const parsedEvents: SPLTokenEvent[] = []
    const works: PendingWork<MintAccount>[] = []
    const promises = ixsContext.map(async (ix) => {
      const account = ix.txContext.parserContext.account
      if (this.mints[account]) {
        const parsedIx = this.mintParser.parse(ix, account)
        if (parsedIx) {
          if (parsedIx.type === SPLTokenEventType.InitializeAccount) {
            const work = {
              id: parsedIx.account,
              time: Date.now(),
              payload: {
                mint: account,
                timestamp: parsedIx.timestamp,
                event: parsedIx,
              },
            }
            works.push(work)
          }
        }
      } else {
        const parsedIx = await this.eventParser.parse(ix)
        if (parsedIx) {
          if (parsedIx.type === SPLTokenEventType.CloseAccount) {
            const work = await this.fetchMintDAL.getFirstValueFromTo(
              [parsedIx.account],
              [parsedIx.account],
              { atomic: true },
            )
            if (work && parsedIx.timestamp >= work.payload.timestamp) {
              await this.accountMints.removeWork(work)
              const options = {
                account: parsedIx.account,
                index: {
                  transactions: true,
                  content: true,
                },
              }
              await this.context.apiClient
                .useBlockchain(Blockchain.Solana)
                .deleteAccount(options)
            }
          }
          parsedEvents.push(parsedIx)
        }
      }
    })

    await Promise.all(promises)

    console.log(`indexing ${ixsContext.length} parsed ixs`)

    if (parsedEvents.length > 0) {
      await this.eventDAL.save(parsedEvents)

      const lastEvent = parsedEvents[0]
      await this.dealBalances(lastEvent)
    }
    if (works.length > 0) {
      await this.accountMints.addWork(works)
    }
  }

  /**
   * Fetch signatures from accounts.
   * @param works Txn signatures with extra properties as time and payload.
   */
  protected async _handleMintAccounts(
    works: PendingWork<MintAccount>[],
  ): Promise<void> {
    console.log(
      `Mint accounts | Start handling ${works.length} minted accounts`,
    )

    for (const work of works) {
      if (!work) continue

      const account = work.id
      const options = {
        account,
        meta: {
          address: account,
          type: SPLTokenType.AccountMint,
          mint: work.payload.mint,
        },
        index: {
          transactions: {
            chunkDelay: 0,
            chunkTimeframe: 1000 * 60 * 60 * 24,
          },
          content: false,
        },
      }
      await this.context.apiClient
        .useBlockchain(Blockchain.Solana)
        .indexAccount(options)
    }
  }

  protected async dealBalances(entity: SPLTokenEvent): Promise<void> {
    const accounts = getEventAccounts(entity)
    const entities = accounts.map((account) => {
      const balance = getBalanceFromEvent(entity, account)
      return {
        account,
        mint: entity.mint,
        owner: entity.owner,
        balance,
        timestamp: entity.timestamp,
      } as SPLAccountBalance
    })
    await this.balanceHistoryDAL.save(entities)
    await this.balanceStateDAL.save(entities)
  }
}
