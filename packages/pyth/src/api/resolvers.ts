import {
  Candle,
  CandleInterval,
  DataFeedData,
  DataFeedStats, GlobalPythStats,
  Price,
} from '../types'
import MainDomain from '../domain/main.js'

export type ReservesFilters = {
  lendingMarket: string
  reserves?: string[]
  includeStats?: boolean
}

export type PricesFilters = {
  address: string
  types?: string[]
  startDate?: number
  endDate?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type CandlesFilters = PricesFilters & { candleInterval: CandleInterval }

export type GlobalStatsFilters = ReservesFilters

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getDataFeeds(): Promise<DataFeedData[]> {
    const result = await this.domain.getDataFeeds(false)
    return Object.values(result)
  }

  async getDataFeedStats(): Promise<Record<string, DataFeedStats>> {
    const result = await this.domain.getDataFeeds(true)
    return Object.fromEntries(
      Object.entries(result).map(([k, v]) => [k, v.stats!]),
    )
  }

  async getPrices({
    address,
    startDate = 0,
    endDate = Date.now(),
    limit = 1000,
    skip = 0,
    reverse = true,
  }: PricesFilters): Promise<Price[]> {
    if (limit < 1 || limit > 1000)
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const result: Price[] = []

    const events = await this.domain.getHistoricalPrices(
      address,
      startDate,
      endDate,
      {
        reverse,
        limit: limit + skip,
      },
    )
    for await (const { value } of events) {
      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(value)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }

  async getCandles({
    address,
    candleInterval,
    startDate = 0,
    endDate = Date.now(),
    limit = 1000,
    skip = 0,
    reverse = true,
  }: CandlesFilters): Promise<Candle[]> {
    if (limit < 1 || limit > 1000)
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const result: Candle[] = []

    const events = await this.domain.getCandles(
      address,
      candleInterval,
      startDate,
      endDate,
      {
        reverse,
        limit: limit + skip,
      },
    )
    for await (const { value } of events) {
      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(value)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }

  async getGlobalStats(args: GlobalStatsFilters): Promise<GlobalPythStats> {
    return this.domain.getGlobalStats()
  }

  protected async filterReserves({
    lendingMarket,
    reserves,
    includeStats,
  }: ReservesFilters): Promise<ReserveData[]> {
    const domReserves = await this.domain.getReserves(includeStats)

    reserves =
      reserves ||
      Object.values(domReserves).map((reserve: any) => reserve.info.address)

    let result = reserves
      .map((address) => domReserves[address])
      .filter((reserve) => !!reserve)

    if (lendingMarket) {
      result = result.filter(
        ({ info }) => info.lendingMarketAddress === lendingMarket,
      )
    }

    return result
  }
}
