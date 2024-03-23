import {
  AccountTimeSeriesStatsManager,
  AccountTimeSeriesStats,
  AccountStatsFilters,
  AccountStats,
} from '@aleph-indexer/framework'
import { EventDALIndex, EventStorage } from '../dal/event.js'
import { MarinadeFinanceEvent } from '../utils/layouts/index.js'
import {
  MarinadeFinanceAccountInfo,
  MarinadeFinanceAccountStats,
} from '../types.js'
import { EventsFilters } from '../api/resolvers.js'

export class AccountDomain {
  constructor(
    public info: MarinadeFinanceAccountInfo,
    protected eventDAL: EventStorage,
    protected timeSeriesStats: AccountTimeSeriesStatsManager<MarinadeFinanceAccountStats>,
  ) {}

  async updateStats(now: number): Promise<void> {
    await this.timeSeriesStats.process(now)
  }

  async getTimeSeriesStats(
    type: string,
    filters: AccountStatsFilters,
  ): Promise<AccountTimeSeriesStats> {
    return this.timeSeriesStats.getTimeSeriesStats(type, filters)
  }

  async getStats(): Promise<AccountStats<MarinadeFinanceAccountStats>> {
    return this.timeSeriesStats.getStats()
  }

  async getEvents(args: EventsFilters): Promise<MarinadeFinanceEvent[]> {
    const {
      types,
      startDate = 0,
      endDate = Date.now(),
      limit = 1000,
      skip = 0,
      reverse = true,
    } = args

    if (limit < 1 || limit > 1000)
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const typesMap = types ? new Set(types) : undefined
    const from = startDate
      ? [this.info.address, startDate]
      : [this.info.address, 0]
    const to = endDate
      ? [this.info.address, endDate]
      : [this.info.address, Date.now()]
    let sk = skip

    const result: MarinadeFinanceEvent[] = []
    const events = await this.eventDAL
      .useIndex(EventDALIndex.AccountTimestamp)
      .getAllFromTo(from, to, { reverse, limit })

    for await (const { value } of events) {
      // @note: Filter by type
      if (typesMap && !typesMap.has(value.type)) continue

      // @note: Skip first N events
      if (--sk >= 0) continue

      result.push(value)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }
}
