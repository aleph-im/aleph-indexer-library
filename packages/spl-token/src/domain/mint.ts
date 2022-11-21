import {
  AccountTimeSeriesStatsManager,
  AccountTimeSeriesStats,
  AccountStatsFilters,
  AccountStats,
} from '@aleph-indexer/framework'
import { EventDALIndex, EventStorage } from '../dal/event.js'
import { SPLTokenEvent } from '../types'
import { MintEventsFilters } from './types.js'

export class Mint {
  constructor(
    public address: string,
    protected eventDAL: EventStorage,
    protected timeSeriesStats: AccountTimeSeriesStatsManager,
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

  async getStats(): Promise<AccountStats> {
    return this.timeSeriesStats.getStats()
  }

  async getEvents(filters: MintEventsFilters): Promise<SPLTokenEvent[]> {
    const { startDate, endDate, types, skip: sk, ...opts } = filters

    const typesMap = types ? new Set(types) : undefined

    let skip = sk || 0
    const limit = opts.limit || 1000
    opts.limit = !typesMap ? limit + skip : undefined

    const result: SPLTokenEvent[] = []

    const events = await this.eventDAL
      .useIndex(EventDALIndex.AccountTimestamp)
      .getAllFromTo([this.address, startDate], [this.address, endDate], opts)

    for await (const { value } of events) {
      // @note: Filter by type
      if (typesMap && !typesMap.has(value.type)) continue

      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(value)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }
}
