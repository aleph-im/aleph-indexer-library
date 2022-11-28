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
import { PendingWorkPool, PendingWork } from '@aleph-indexer/core'
import { eventParser as eParser } from '../parsers/event.js'
import { mintParser as mParser } from '../parsers/mint.js'
import { createEventDAL } from '../dal/event.js'
import {
  SPLTokenAccount,
  SPLTokenEvent,
  SPLTokenEventType, SPLTokenInfo,
  SPLTokenType,
} from '../types.js'
import { Mint } from './mint.js'
import { createAccountStats } from './stats/timeSeries.js'
import { TOKEN_PROGRAM_ID } from '../constants.js'
import { isParsedIx } from '../utils/utils.js'
import { createFetchMintDAL } from '../dal/fetchMint.js'
import { MintAccount } from './types.js'
import { createTokenDAL } from '../dal/token.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements IndexerWorkerDomainWithStats
{
  protected mints: Record<string, Mint> = {}
  protected mintAccounts: Record<string, string[]> = {}
  protected accountMints: PendingWorkPool<MintAccount>

  constructor(
    protected context: IndexerDomainContext,
    protected eventParser = eParser,
    protected mintParser = mParser,
    protected eventDAL = createEventDAL(context.dataPath),
    protected statsStateDAL = createStatsStateDAL(context.dataPath),
    protected statsTimeSeriesDAL = createStatsTimeSeriesDAL(context.dataPath),
    protected fetchMintDAL = createFetchMintDAL(context.dataPath),
    protected tokenDAL = createTokenDAL(context.dataPath),
    protected programId = TOKEN_PROGRAM_ID,
  ) {
    super(context)
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
    const { projectId, apiClient: indexerApi } = this.context

    if (meta.type === SPLTokenType.Mint) {
      const accountTimeSeries = await createAccountStats(
        projectId,
        account,
        indexerApi,
        this.eventDAL,
        this.statsStateDAL,
        this.statsTimeSeriesDAL,
      )

      this.mints[account] = new Mint(account, this.eventDAL, accountTimeSeries)
      this.mintAccounts[account] = this.mintAccounts[account] || []
    }
    if (meta.type === SPLTokenType.AccountMint) {
      this.mintAccounts[meta.mint].push(account)
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

  async getToken(account: string): Promise<SPLTokenInfo | undefined> {
    return await this.tokenDAL.getFirstValueFromTo([account], [account])
  }

  protected async filterInstructions(
    ixsContext: InstructionContextV1[],
  ): Promise<InstructionContextV1[]> {
    return ixsContext.filter(({ ix }) => isParsedIx(ix))
  }

  protected async indexInstructions(
    ixsContext: InstructionContextV1[],
  ): Promise<void> {
    const parsedEvents: SPLTokenEvent[] = []
    const works: PendingWork<MintAccount>[] = []
    ixsContext.map((ix) => {
      const account = ix.txContext.parserContext.account
      if (this.mints[account]) {
        const parsedIx = this.mintParser.parse(ix, account)
        if (parsedIx && parsedIx.type === SPLTokenEventType.InitializeAccount) {
          const work = {
            id: parsedIx.account,
            time: Date.now(),
            payload: {
              mint: account,
              timestamp: parsedIx.timestamp,
            },
          }
          works.push(work)
        }
      } else {
        const parsedIx = this.eventParser.parse(ix)
        if (parsedIx) {
          parsedEvents.push(parsedIx)
        }
      }
    })

    console.log(`indexing ${ixsContext.length} parsed ixs`)

    if (parsedEvents.length > 0) {
      await this.eventDAL.save(parsedEvents)
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
}
