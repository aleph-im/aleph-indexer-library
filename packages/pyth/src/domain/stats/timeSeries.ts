import {
  AccountTimeSeriesStatsManager,
  IndexerMsI,
  StatsStateStorage,
  StatsTimeSeriesStorage,
  TimeSeriesStats,
} from '@aleph-indexer/framework'
import { PriceStorage } from '../../dal/price.js'
import { Candle, Price } from '../../types.js'
import pythCandleAggregator from './CandleAggregator.js'
import { timeFrames } from '../../constants.js'

export function createCandles(
  account: string,
  indexerApi: IndexerMsI,
  priceDAL: PriceStorage,
  statsStateDAL: StatsStateStorage,
  statsTimeSeriesDAL: StatsTimeSeriesStorage,
): AccountTimeSeriesStatsManager {
  const timeSeriesStats = new TimeSeriesStats<Price, Candle>(
    {
      type: 'candle',
      startDate: 0,
      timeFrames,
      getInputStream: ({ account, startDate, endDate }) => {
        return priceDAL.getAllFromTo([startDate], [endDate])
      },
      aggregate: ({ input, prevValue }): Candle => {
        return pythCandleAggregator.aggregate(input, prevValue)
      },
    },
    statsStateDAL,
    statsTimeSeriesDAL,
  )

  return new AccountTimeSeriesStatsManager(
    {
      account,
      series: [timeSeriesStats],
    },
    indexerApi,
    statsStateDAL,
    statsTimeSeriesDAL,
  )
}
