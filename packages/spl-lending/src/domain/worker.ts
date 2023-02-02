import {
  IndexerDomainContext,
  AccountIndexerConfigWithMeta,
  IndexerWorkerDomain,
  IndexerWorkerDomainWithStats,
  createStatsStateDAL,
  createStatsTimeSeriesDAL,
  AccountTimeSeriesStats,
  AccountStatsFilters,
  AccountStats,
  ParserContext,
} from '@aleph-indexer/framework'
import {
  isParsedIx,
  SolanaIndexerWorkerDomainI,
  SolanaParsedInstructionContext,
  SolanaParsedTransaction,
} from '@aleph-indexer/solana'
import { eventParser as eParser } from '../parsers/event.js'
import { createEventDAL } from '../dal/event.js'
import { LendingEvent, LendingReserveInfo } from '../types.js'
import { Reserve } from './reserve.js'
import { createAccountStats } from './stats/timeSeries.js'
import { ACCOUNT_MAP } from '../constants.js'
import { ReserveEventsFilters } from './types.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements SolanaIndexerWorkerDomainI, IndexerWorkerDomainWithStats
{
  protected reserves: Record<string, Reserve> = {}

  constructor(
    protected context: IndexerDomainContext,
    protected eventParser = eParser,
    protected eventDAL = createEventDAL(context.dataPath),
    protected statsStateDAL = createStatsStateDAL(context.dataPath),
    protected statsTimeSeriesDAL = createStatsTimeSeriesDAL(context.dataPath),
    protected programId = ACCOUNT_MAP[context.projectId],
  ) {
    super(context)
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<LendingReserveInfo>,
  ): Promise<void> {
    const { account, blockchainId, meta } = config
    const { projectId, apiClient: indexerApi } = this.context

    const accountTimeSeries = await createAccountStats(
      projectId,
      blockchainId,
      account,
      indexerApi,
      this.eventDAL,
      this.statsStateDAL,
      this.statsTimeSeriesDAL,
    )

    this.reserves[account] = new Reserve(meta, this.eventDAL, accountTimeSeries)

    console.log('Account indexing', this.context.instanceName, account)
  }

  async updateStats(account: string, now: number): Promise<void> {
    const reserve = this.getReserve(account)
    await reserve.updateStats(now)
  }

  async getTimeSeriesStats(
    account: string,
    type: string,
    filters: AccountStatsFilters,
  ): Promise<AccountTimeSeriesStats> {
    const reserve = this.getReserve(account)
    return reserve.getTimeSeriesStats(type, filters)
  }

  async getStats(account: string): Promise<AccountStats> {
    return this.getReserveStats(account)
  }

  async solanaFilterInstruction(
    context: ParserContext,
    entity: SolanaParsedInstructionContext,
  ): Promise<boolean> {
    return (
      isParsedIx(entity.instruction) &&
      entity.instruction.programId === this.programId.program
    )
  }

  async solanaIndexInstructions(
    context: ParserContext,
    entities: SolanaParsedInstructionContext[],
  ): Promise<void> {
    const parsedIxs = entities.map((entity) => this.eventParser.parse(entity))

    console.log(`indexing ${entities.length} parsed ixs`)

    await this.eventDAL.save(parsedIxs)
  }

  // ------------- Custom impl methods -------------------

  async getReserveInfo(reserve: string): Promise<LendingReserveInfo> {
    const res = this.getReserve(reserve)
    return res.info
  }

  async getReserveStats(reserve: string): Promise<AccountStats> {
    const res = this.getReserve(reserve)
    return res.getStats()
  }

  async getReserveEvents(
    reserve: string,
    filters: ReserveEventsFilters,
  ): Promise<LendingEvent[]> {
    const res = this.getReserve(reserve)
    return res.getEvents(filters)
  }

  private getReserve(reserve: string): Reserve {
    const reserveInstance = this.reserves[reserve]
    if (!reserveInstance) throw new Error(`Reserve ${reserve} does not exist`)
    return reserveInstance
  }
}
