import {
  AccountIndexerConfigWithMeta,
  AccountStatsFilters,
  createStatsStateDAL,
  createStatsTimeSeriesDAL,
  IndexerDomainContext,
  IndexerWorkerDomain,
  IndexerWorkerDomainWithStats,
  InstructionContextV1,
} from '@aleph-indexer/framework'
import { PendingWork, PendingWorkPool } from '@aleph-indexer/core'
import {
  createEventParser,
  TokenEventParser as eventParser,
} from '../parsers/tokenEvent.js'
import { mintParser as mParser } from '../parsers/mint.js'
import { createEventDAL } from '../dal/event.js'
import {
  SPLTokenHolding,
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
import { MintAccount, TokenHoldersFilters } from './types.js'
import { createBalanceHistoryDAL } from '../dal/balanceHistory.js'
import { createBalanceStateDAL } from '../dal/balanceState.js'
import { createAccountMintDAL } from '../dal/accountMints.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements IndexerWorkerDomainWithStats
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

  async init(): Promise<void> {
    return
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

  async getTimeSeriesStats(
    account: string,
    type: string,
    filters: AccountStatsFilters,
  ): Promise<any> {
    return {}
  }

  async getStats(account: string): Promise<any> {
    return {}
  }

  async updateStats(account: string, now: number): Promise<void> {
    console.log('', account)
  }

  async getTokenHoldings(
    account: string,
    filters: TokenHoldersFilters,
  ): Promise<SPLTokenHolding[]> {
    const mint = this.mints[account]
    if (!mint) return []
    return await mint.getTokenHoldings(filters)
  }

  protected async filterInstructions(
    ixsContext: InstructionContextV1[],
  ): Promise<InstructionContextV1[]> {
    return ixsContext.filter(({ ix }) => isSPLTokenInstruction(ix))
  }

  protected async indexInstructions(
    ixsContext: InstructionContextV1[],
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
              await this.context.apiClient.deleteAccount(options)
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
      await this.context.apiClient.indexAccount(options)
    }
  }

  protected async dealBalances(entity: SPLTokenEvent): Promise<void> {
    const accounts = getEventAccounts(entity)
    const entities = accounts.map((account) => {
      const balance = getBalanceFromEvent(entity, account)
      return {
        account,
        tokenMint: entity.mint,
        holderAccount: entity.owner,
        balances: {
          wallet: balance,
          total: balance,
        },
        timestamp: entity.timestamp,
      } as SPLTokenHolding
    })
    await this.balanceHistoryDAL.save(entities)
    await this.balanceStateDAL.save(entities)
  }
}
