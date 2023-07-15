export function renderStatsFiles(Name: string): [string, string][] {
  const files: [string, string][] = [];

  files.push(['timeSeries', createTimeSeries(Name)]);
  files.push(['timeSeriesAggregator', createTimeSeriesAggregator(Name)]);
  files.push(['statsAggregator', createstatsAggregator(Name)]);

  return files;
}

function createTimeSeries(Name: string): string {
  return `import {
    AccountTimeSeriesStatsManager,
    Blockchain,
    IndexerMsClient,
    StatsStateStorage,
    StatsTimeSeriesStorage,
    TimeFrame,
    TimeSeriesStats,
  } from '@aleph-indexer/framework'
  import { EventDALIndex, EventStorage } from '../../dal/event.js'
  import { ParsedEvents } from '../../utils/layouts/index.js'
  import { AccessTimeStats, ${Name}AccountStats } from '../../types.js'
  import statsAggregator from './statsAggregator.js'
  import accessAggregator from './timeSeriesAggregator.js'
  
  export async function createAccountStats(
    blockchainId: Blockchain,
    account: string,
    indexerApi: IndexerMsClient,
    eventDAL: EventStorage,
    statsStateDAL: StatsStateStorage,
    statsTimeSeriesDAL: StatsTimeSeriesStorage,
  ): Promise<AccountTimeSeriesStatsManager<${Name}AccountStats>> {
      
    // @note: this aggregator is used to aggregate usage stats for the account
    const accessTimeSeries = new TimeSeriesStats<ParsedEvents, AccessTimeStats>(
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
  
    return new AccountTimeSeriesStatsManager<${Name}AccountStats>(
      {
        blockchainId,
        type: IndexableEntityType.Transaction,
        account,
        series: [accessTimeSeries],  // place your other aggregated stats here
        aggregate(args) {
          return statsAggregator.aggregate(args)
        },
      },
      indexerApi,
      statsStateDAL,
      statsTimeSeriesDAL,
    )
  }
  `;
}

function createTimeSeriesAggregator(Name: string): string {
  return `import { AccessTimeStats } from '../../types.js'
  import { ParsedEvents } from '../../utils/layouts/index.js'
  
  export class AccessTimeSeriesAggregator {
    aggregate(    
      curr: ParsedEvents | AccessTimeStats,
      prev?: AccessTimeStats,
    ): AccessTimeStats {
      prev = this.prepareAccessStats(prev)
      this.processAccessStats(prev, curr)
   
      return prev
    }
  
    getEmptyAccessTimeStats(): AccessTimeStats {
      return {
        accesses: 0,
        accessesByProgramId: {},
        startTimestamp: undefined,
        endTimestamp: undefined,
      }
    }
  
    protected prepareAccessStats(info?: AccessTimeStats): AccessTimeStats {
      return info || this.getEmptyAccessTimeStats()
    }
  
    // @note: We assume that curr data is sorted by time
    protected processAccessStats(
      acc: AccessTimeStats,
      curr: ParsedEvents | AccessTimeStats,
    ): AccessTimeStats {
      if ((curr as ParsedEvents).timestamp) {
        const event = curr as ParsedEvents
        let signer: string;
        signer = event.signer as unknown as string
        acc.accesses++
        acc.accessesByProgramId[signer] = acc.accessesByProgramId[signer]
          ? acc.accessesByProgramId[signer] + 1
          : 1
        if(!acc.startTimestamp || acc.startTimestamp > event.timestamp) {
          acc.startTimestamp = event.timestamp
        }
        if(!acc.endTimestamp || acc.endTimestamp < event.timestamp) {
          acc.endTimestamp = event.timestamp
        }
      } else {
        acc.accesses += (curr as AccessTimeStats).accesses || 0
        if ((curr as AccessTimeStats).accessesByProgramId) {
          Object.entries((curr as AccessTimeStats).accessesByProgramId).forEach(
            ([programId, count]) => {
              acc.accessesByProgramId[programId] = acc.accessesByProgramId[
                programId
              ]
                ? acc.accessesByProgramId[programId] + count
                : count
            },
          )
        }
        if(!acc.startTimestamp) {
          acc.startTimestamp = (curr as AccessTimeStats).startTimestamp
        } else if (
          (curr as AccessTimeStats).startTimestamp
          && acc.startTimestamp > ((curr as AccessTimeStats).startTimestamp as number)
        ) {
          acc.startTimestamp = (curr as AccessTimeStats).startTimestamp
        }
        if(!acc.endTimestamp) {
          acc.endTimestamp = (curr as AccessTimeStats).endTimestamp
        } else if (
          (curr as AccessTimeStats).endTimestamp
          && acc.endTimestamp < ((curr as AccessTimeStats).endTimestamp as number)
        ) {
          acc.endTimestamp = (curr as AccessTimeStats).endTimestamp
        }
      }
      return acc
    }
  
    protected is${Name}Event(
      event: ParsedEvents | AccessTimeStats,
    ): event is ParsedEvents {
      return 'type' in event
    }
  }
  
  export const accessAggregator = new AccessTimeSeriesAggregator()
  export default accessAggregator
  `;
}

function createstatsAggregator(Name: string): string {
  return `import { DateTime } from 'luxon'
  import { TimeFrame, AccountAggregatorFnArgs } from '@aleph-indexer/framework'
  import { ${Name}AccountStats } from '../../types.js'
  import accessAggregator from './timeSeriesAggregator.js'
  
  export class StatsAggregator {
    async aggregate(
      args: AccountAggregatorFnArgs,
    ): Promise<${Name}AccountStats> {
      const { now, account, timeSeriesDAL } = args
  
      const stats = this.getEmptyStats()
      const type = 'access'
      const currHour = DateTime.fromMillis(now).startOf('hour')
      const commonFields = [account, type, TimeFrame.Hour]
  
      const last1h = await timeSeriesDAL.get([
        ...commonFields,
        currHour.toMillis(),
      ])
  
      const last24hEvents = await timeSeriesDAL.getAllValuesFromTo(
        [...commonFields, currHour.minus({ hours: 24 }).toMillis()],
        [...commonFields, currHour.toMillis()],
      )
  
      let last24h
      for await (const event of last24hEvents) {
        last24h = accessAggregator.aggregate(event.data, last24h)
      }
  
      const last7dEvents = await timeSeriesDAL.getAllValuesFromTo(
        [...commonFields, currHour.minus({ hours: 24 * 7 }).toMillis()],
        [...commonFields, currHour.toMillis()],
      )
  
      let last7d
      for await (const event of last7dEvents) {
        last7d = accessAggregator.aggregate(event.data, last7d)
      }
      const total = await timeSeriesDAL.get([account, type, TimeFrame.All, 0])
  
      if (last1h) stats.last1h = last1h.data
      if (last24h) stats.last24h = last24h
      if (last7d) stats.last7d = last7d
      if (total) stats.total = total.data
  
      stats.accessingPrograms = new Set<string>([
        ...(Object.keys(stats.total?.accessesByProgramId) || [])]
      )
  
      return stats
    }
  
    protected getEmptyStats(): ${Name}AccountStats {
      return {
        requestsStatsByHour: {},
        last1h: accessAggregator.getEmptyAccessTimeStats(),
        last24h: accessAggregator.getEmptyAccessTimeStats(),
        last7d: accessAggregator.getEmptyAccessTimeStats(),
        total: accessAggregator.getEmptyAccessTimeStats(),
        accessingPrograms: new Set<string>(),
      }
    }
  }
  
  export const statsAggregator = new StatsAggregator()
  export default statsAggregator
  `;
}