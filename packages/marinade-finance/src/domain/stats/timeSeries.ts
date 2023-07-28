import {
  AccountTimeSeriesStatsManager,
  Blockchain,
  IndexableEntityType,
  IndexerMsClient,
  StatsStateStorage,
  StatsTimeSeriesStorage,
  TimeFrame,
  TimeSeriesStats,
} from '@aleph-indexer/framework'
import { EventDALIndex, EventStorage } from '../../dal/event.js'
import { MarinadeFinanceEvent } from '../../utils/layouts/index.js'
import { AccessTimeStats, MarinadeFinanceAccountStats } from '../../types.js'
import statsAggregator from './statsAggregator.js'
import accessAggregator from './timeSeriesAggregator.js'

export async function createAccountStats(
  blockchainId: Blockchain,
  account: string,
  indexerApi: IndexerMsClient,
  eventDAL: EventStorage,
  statsStateDAL: StatsStateStorage,
  statsTimeSeriesDAL: StatsTimeSeriesStorage,
): Promise<AccountTimeSeriesStatsManager<MarinadeFinanceAccountStats>> {
  // @note: this aggregator is used to aggregate usage stats for the account
  const accessTimeSeries = new TimeSeriesStats<
    MarinadeFinanceEvent,
    AccessTimeStats
  >(
    {
      type: 'access',
      startDate: 0,
      timeFrames: [
        TimeFrame.Hour,
        TimeFrame.Day,
        TimeFrame.Week,
        TimeFrame.Month,
        TimeFrame.Year,
        TimeFrame.All,
      ],
      getInputStream: async ({ account, startDate, endDate }) => {
        return await eventDAL
          .useIndex(EventDALIndex.AccountTimestamp)
          .getAllValuesFromTo([account, startDate], [account, endDate])
      },
      aggregate: ({ input, prevValue }): AccessTimeStats => {
        return accessAggregator.aggregate(input, prevValue)
      },
    },
    statsStateDAL,
    statsTimeSeriesDAL,
  )

  return new AccountTimeSeriesStatsManager<MarinadeFinanceAccountStats>(
    {
      blockchainId,
      type: IndexableEntityType.Transaction,
      account,
      series: [accessTimeSeries], // place your other aggregated stats here
      aggregate(args) {
        return statsAggregator.aggregate(args)
      },
    },
    indexerApi,
    statsStateDAL,
    statsTimeSeriesDAL,
  )
}
