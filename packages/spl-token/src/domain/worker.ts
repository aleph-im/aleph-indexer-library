import {
  AccountIndexerConfigWithMeta,
  AccountStats,
  AccountStatsFilters,
  AccountTimeSeriesStats,
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
  SPLToken,
  SPLTokenEvent,
  SPLTokenEventType,
  SPLTokenType,
} from '../types.js'
import { Mint } from './mint.js'
import { createAccountStats } from './stats/timeSeries.js'
import { TOKEN_PROGRAM_ID } from '../constants.js'
import { isSPLTokenParsedInstruction } from '../utils/utils'
import { createFetchMintDAL } from '../dal/fetchMint'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements IndexerWorkerDomainWithStats
{
  protected mints: Record<string, Mint> = {}
  protected accountMints: PendingWorkPool<string[]>

  constructor(
    protected context: IndexerDomainContext,
    protected eventParser = eParser,
    protected mintParser = mParser,
    protected eventDAL = createEventDAL(context.dataPath),
    protected statsStateDAL = createStatsStateDAL(context.dataPath),
    protected statsTimeSeriesDAL = createStatsTimeSeriesDAL(context.dataPath),
    protected fetchMintDAL = createFetchMintDAL(context.dataPath),
    protected programId = TOKEN_PROGRAM_ID,
  ) {
    super(context)
    this.accountMints = new PendingWorkPool({
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
    config: AccountIndexerConfigWithMeta<SPLToken>,
  ): Promise<void> {
    const { account, type } = config
    const { projectId, apiClient: indexerApi } = this.context

    const accountTimeSeries = await createAccountStats(
      projectId,
      account,
      indexerApi,
      this.eventDAL,
      this.statsStateDAL,
      this.statsTimeSeriesDAL,
    )

    if (type === SPLTokenType.Mint) {
      this.mints[account] = new Mint(account, this.eventDAL, accountTimeSeries)
    }
    console.log('Account indexing', this.context.instanceName, account)
  }

  async getTimeSeriesStats(
    account: string,
    type: string,
    filters: AccountStatsFilters,
  ): Promise<AccountTimeSeriesStats> {
    return {}
  }

  async getStats(account: string): Promise<AccountStats> {
    return {}
  }

  protected async filterInstructions(
    ixsContext: InstructionContextV1[],
  ): Promise<InstructionContextV1[]> {
    return ixsContext.filter(({ ix }) => isSPLTokenParsedInstruction(ix))
  }

  protected async indexInstructions(
    ixsContext: InstructionContextV1[],
  ): Promise<void> {
    const parsedEvents: SPLTokenEvent[] = []
    ixsContext.map((ix) => {
      const account = ix.txContext.parserContext.account
      if (this.mints[account]) {
        const parsedIx = this.mintParser.parse(ix, account)
        if (parsedIx && parsedIx.type === SPLTokenEventType.InitializeAccount) {
          const work = {
            id: account,
            time: Date.now(),
            payload: {
              mint: account,
              timestamp: parsedIx.timestamp,
            },
          }
          this.accountMints.addWork(work)
        }
      } else {
        const parsedIx = this.eventParser.parse(ix)
        if (parsedIx) {
          parsedEvents.push(parsedIx)
        }
      }
    })

    console.log(`indexing ${ixsContext.length} parsed ixs`)

    await this.eventDAL.save(parsedEvents)
  }

  /**
   * Fetch signatures from accounts.
   * @param works Txn signatures with extra properties as time and payload.
   */
  protected async _handleMintAccounts(
    works: PendingWork<string[]>[],
  ): Promise<void> {
    console.log(
      `Mint accounts | Start handling ${works.length} minted accounts`,
    )

    for (const work of works) {
      const account = work.id
      const options = {
        account,
        meta: { type: SPLTokenType.AccountMint, payload: work.payload },
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
