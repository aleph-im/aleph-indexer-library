import { StorageStream, Utils } from '@aleph-indexer/core'
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
} from '@aleph-indexer/solana'
import { eventParser as eParser } from '../parsers/event.js'
import { createEventDAL } from '../dal/event.js'
import { BrickEvent } from '../utils/layouts/index.js'
import { BrickAccountStats, BrickAccountInfo } from '../types.js'
import { AccountDomain } from './account.js'
import { createAccountStats } from './stats/timeSeries.js'
import { BRICK_PROGRAM_ID } from '../constants.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements SolanaIndexerWorkerDomainI, IndexerWorkerDomainWithStats
{
  protected accounts: Record<string, AccountDomain> = {}

  constructor(
    protected context: IndexerDomainContext,
    protected eventParser = eParser,
    protected eventDAL = createEventDAL(context.dataPath),
    protected statsStateDAL = createStatsStateDAL(context.dataPath),
    protected statsTimeSeriesDAL = createStatsTimeSeriesDAL(context.dataPath),
    protected programId = BRICK_PROGRAM_ID,
  ) {
    super(context)
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<BrickAccountInfo>,
  ): Promise<void> {
    const { blockchainId, account, meta } = config
    const { apiClient } = this.context

    const accountTimeSeries = await createAccountStats(
      blockchainId,
      account,
      apiClient,
      this.eventDAL,
      this.statsStateDAL,
      this.statsTimeSeriesDAL,
    )

    this.accounts[account] = new AccountDomain(
      meta,
      this.eventDAL,
      accountTimeSeries,
    )

    console.log('Account indexing', this.context.instanceName, account)
  }

  async updateStats(account: string, now: number): Promise<void> {
    const actual = this.getAccount(account)
    await actual.updateStats(now)
  }

  async getTimeSeriesStats(
    account: string,
    type: string,
    filters: AccountStatsFilters,
  ): Promise<AccountTimeSeriesStats> {
    const actual = this.getAccount(account)
    return actual.getTimeSeriesStats(type, filters)
  }

  async getStats(account: string): Promise<AccountStats<BrickAccountStats>> {
    return this.getAccountStats(account)
  }

  async solanaFilterInstruction(
    context: ParserContext,
    entity: SolanaParsedInstructionContext,
  ): Promise<boolean> {
    return (
      isParsedIx(entity.instruction) &&
      entity.instruction.programId === BRICK_PROGRAM_ID
    )
  }

  async solanaIndexInstructions(
    context: ParserContext,
    ixsContext: SolanaParsedInstructionContext[],
  ): Promise<void> {
    if ('account' in context) {
      const parsedIxs = ixsContext.map((ix) =>
        this.eventParser.parse(ix, context.account),
      )

      console.log(`indexing ${ixsContext.length} parsed ixs`)

      await this.eventDAL.save(parsedIxs)
    }
  }

  // ------------- Custom impl methods -------------------

  async getAccountInfo(actual: string): Promise<BrickAccountInfo> {
    const res = this.getAccount(actual)
    return res.info
  }

  async getAccountStats(
    actual: string,
  ): Promise<AccountStats<BrickAccountStats>> {
    const res = this.getAccount(actual)
    return res.getStats()
  }

  getAccountEventsByTime(
    account: string,
    startDate: number,
    endDate: number,
    opts: any,
  ): Promise<StorageStream<string, BrickEvent>> {
    const res = this.getAccount(account)
    return res.getEventsByTime(startDate, endDate, opts)
  }

  private getAccount(account: string): AccountDomain {
    const accountInstance = this.accounts[account]
    if (!accountInstance) throw new Error(`Account ${account} does not exist`)
    return accountInstance
  }
}
