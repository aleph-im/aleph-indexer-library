import {
  AccountTimeSeriesStatsManager,
  IndexerMsI,
  StatsStateStorage,
  StatsTimeSeriesStorage,
  TimeFrame,
  TimeSeriesStats,
} from '@aleph-indexer/framework'
import { EventDALIndex, EventStorage } from '../../dal/event.js'
import { SPLTokenEvent, SPLTokenInfo } from '../../types'

export async function createAccountStats(
  projectId: string,
  account: string,
  indexerApi: IndexerMsI,
  eventDAL: EventStorage,
  statsStateDAL: StatsStateStorage,
  statsTimeSeriesDAL: StatsTimeSeriesStorage,
): Promise<AccountTimeSeriesStatsManager<any>> {
  const LendingTimeSeries = new TimeSeriesStats<SPLTokenEvent, SPLTokenInfo>(
    {
      type: 'lending',
      startDate: 0,
      timeFrames: [
        TimeFrame.Hour,
        TimeFrame.Day,
        TimeFrame.Week,
        TimeFrame.Month,
        TimeFrame.Year,
        TimeFrame.All,
      ],
      getInputStream: ({ account, startDate, endDate }) => {
        return eventDAL
          .useIndex(EventDALIndex.AccountTimestamp)
          .getAllValuesFromTo([account, startDate], [account, endDate])
      },
      aggregate: ({ input, prevValue }): any => {
        return {}
      },
    },
    statsStateDAL,
    statsTimeSeriesDAL,
  )

  const accountTimeSeries = new AccountTimeSeriesStatsManager(
    {
      account,
      series: [LendingTimeSeries],
      async aggregate(args) {
        return {}
      },
    },
    indexerApi,
    statsStateDAL,
    statsTimeSeriesDAL,
  )

  return accountTimeSeries
}
