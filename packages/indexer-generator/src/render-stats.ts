import { ViewInstructions } from './types.js'

export function renderStatsFiles(
  Name: string,
  instructions: ViewInstructions | undefined,
  filename: string,
): string[] {
  const NAME = filename.toUpperCase()

  const timeSeries = `import {
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
`
  let timeSeriesAggregator = ''
  if (instructions) {
    timeSeriesAggregator = `import { AccessTimeStats } from '../../types.js'
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
`
  }

  const statsAggregator = `import { DateTime } from 'luxon'
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
`

  const mockDAL = `import { createStatsStateDAL, createStatsTimeSeriesDAL } from "@aleph-indexer/framework";
import { createEventDAL } from "../../../dal/event";
import { InstructionType, ParsedEvents } from "../../../utils/layouts";
import * as fs from "fs";
import { ${NAME}_PROGRAM_ID } from "../../../constants";
import { DateTime, Interval } from "luxon";

export async function mockEventDAL(testName: string, eventConfig: { interval?: Interval, eventCnt: number }) {
  const eventDAL = createEventDAL(\`packages/${filename}/src/domain/stats/__mocks__/data/\${testName}\`);
  const all = await eventDAL.getAll()
  let i = 0
  for await(const event of all) {
    i++
  }
  if (i === 0 || i < eventConfig.eventCnt) {
    const events = Array.from(
      {length: eventConfig.eventCnt - i},
      generateEvent.bind(null, eventConfig.interval)
    );
    await eventDAL.save(events);
  }
  return eventDAL;
}

export function mockStatsStateDAL(testName: string) {
  // delete the stats_state folder, if existent
  const path = \`packages/${filename}/src/domain/stats/__mocks__/data/\${testName}/stats_state\`
  if (fs.existsSync(path)) {
    fs.rmdirSync(path, { recursive: true });
  }
  return createStatsStateDAL(\`packages/${filename}/src/domain/stats/__mocks__/data/\${testName}\`);
}

export function mockStatsTimeSeriesDAL(testName: string) {
  // delete the stats_time_series folder, if existent
  const path = \`packages/${filename}/src/domain/stats/__mocks__/data/\${testName}/stats_time_series\`
  if (fs.existsSync(path)) {
    fs.rmdirSync(path, { recursive: true });
  }
  return createStatsTimeSeriesDAL(\`packages/${filename}/src/domain/stats/__mocks__/data/\${testName}\`);
}

// get random InstructionType
function getRandomInstructionType() {
  const values = Object.values(InstructionType);
  return values[Math.floor(Math.random() * values.length)];
}

// generate random events
function generateEvent(interval?: Interval): ParsedEvents {
  if (!interval) {
    interval = Interval.fromDateTimes(
      new Date(2019, 1, 1),
      DateTime.now()
    )
  }
  const timestamp = interval.start.plus(
    {milliseconds: Math.floor(Math.random() * interval.length('milliseconds'))}
  ).toMillis()
  return {
    id: Math.random().toString(36).substring(2),
    account: "test",
    timestamp,
    type: getRandomInstructionType(),
    signer: "CNCnPo5Fhfjj5Y7DSc82RDJfQoHEd2haAnTkAwRGfo8z",
    programId: ${NAME}_PROGRAM_ID,
    data: {} as any,
    accounts: {} as any,
  }
}  
`

  const mockIndexer = `import {
  AccountIndexerState,
  GetAccountIndexingStateRequestArgs,
  IndexerMsI
} from "@aleph-indexer/framework";
import { DateTime, Interval } from "luxon";
import { EventStorage } from "../../../dal/event";
import { ParsedEvents } from "../../../utils/layouts";

export async function mockMainIndexer(eventDAL: EventStorage) {
    const events = await eventDAL.getAll()
    let earliest: ParsedEvents = {} as any
    let latest: ParsedEvents = {} as any
    for await (const event of events) {
      if(event.value.timestamp < earliest.timestamp || !earliest.timestamp) {
        earliest = event.value
      }
      if(event.value.timestamp > latest.timestamp || !latest.timestamp) {
        latest = event.value
      }
    }
  return { getAccountState(args: GetAccountIndexingStateRequestArgs): Promise<AccountIndexerState | undefined> {
    return Promise.resolve({
      account: 'test',
      accurate: true,
      progress: 100,
      pending: [],
      processed: [Interval.fromDateTimes(DateTime.fromMillis(earliest.timestamp), DateTime.fromMillis(latest.timestamp)).toISO()],
    })
  }} as IndexerMsI
}
`

  const timeSeriesTest = `import { jest } from '@jest/globals'
import { createAccountStats}  from '../timeSeries.js'
import { mockEventDAL, mockStatsStateDAL, mockStatsTimeSeriesDAL } from '../__mocks__/DAL.js'
import { mockMainIndexer } from "../__mocks__/indexer.js";
import { DateTime, Interval } from "luxon";
import { ParsedEvents } from "../../../utils/layouts/index.js";
import { EventStorage } from "../../../dal/event.js";
import { TimeFrame } from "@aleph-indexer/framework/dist/src/utils";
// jest.useFakeTimers()
jest.setTimeout(30000)

async function mockAccountStats(eventDAL: EventStorage, account: string, testName: string) {
  const statsStateDAL = mockStatsStateDAL(testName)
  const statsTimeSeriesDAL = mockStatsTimeSeriesDAL(testName)
  const mainIndexer = await mockMainIndexer(eventDAL)
  return await createAccountStats(
    account,
    mainIndexer,
    eventDAL,
    statsStateDAL,
    statsTimeSeriesDAL
  );
}

describe('AccountTimeSeries', () => {
  it('getStats with one event far in the past', async () => {
    const accountAddress = 'test'
    const testName = 'AccountStatsOneEventFarInThePast'
    const eventDAL = await mockEventDAL('AccountStatsOneEventFarInThePast', {
      eventCnt: 1,
      interval: Interval.fromDateTimes(new Date(2019, 1, 1), new Date(2019, 1, 1))
    })
    const accountStats = await mockAccountStats(eventDAL, accountAddress, testName);

    const events = await eventDAL.getAll()
    let eventCnt = 0
    let earliest: ParsedEvents = {} as any
    for await (const event of events) {
      eventCnt++;
      if(event.value.timestamp < earliest.timestamp || !earliest.timestamp) {
        earliest = event.value
      }
    }

    await accountStats.init()
    await accountStats.process(Date.now())
    const stats = await accountStats.getStats()
    expect(stats.stats.accessingPrograms.has(earliest.signer)).toBe(true)
    expect(stats.stats.total.accesses).toEqual(eventCnt)
  })

  it('getStats with many recent events', async () => {
    const accountAddress = 'test'
    const testName = 'AccountStatsManyRecentEvents'
    const eventDAL = await mockEventDAL(testName, {
      eventCnt: 100,
      interval: Interval.fromDateTimes(DateTime.now().minus({day: 1}), DateTime.now())
    })
    const accountStats = await mockAccountStats(eventDAL, accountAddress, testName);

    const events = await eventDAL.getAll()
    let eventCnt = 0
    for await (const event of events) {
      eventCnt++;
    }

    await accountStats.init()
    await accountStats.process(Date.now())
    const stats = await accountStats.getStats()
    expect(stats.stats.total.accesses).toEqual(eventCnt)
    expect(stats.stats.accessingPrograms.size).toBeGreaterThan(0)
    expect(stats.stats.last7d.accesses).toEqual(eventCnt)
  })

  it('getTimeSeriesStats with many spread out events tested on accuracy', async () => {
    const accountAddress = 'test'
    const testName = 'AccountStatsSomeSpreadOutEvents'
    const eventDAL = await mockEventDAL(testName, {
      eventCnt: 1000,
      interval: Interval.fromDateTimes(DateTime.now().minus({year: 1}), DateTime.now())
    })
    const accountStats = await mockAccountStats(eventDAL, accountAddress, testName);

    let events = await eventDAL.getAll()
    let eventCnt = 0
    for await (const event of events) {
      eventCnt++;
    }

    await accountStats.init()
    await accountStats.process(Date.now())
    const stats = await accountStats.getStats()
    expect(stats.stats.total.accesses).toEqual(eventCnt)
    expect(stats.stats.accessingPrograms.size).toBeGreaterThan(0)

    // Check day stats
    const dayStats = await accountStats.getTimeSeriesStats('access', {
      timeFrame: TimeFrame.Day
    })
    expect(dayStats.series.length).toBeGreaterThan(0)
    const dayAccesses = dayStats.series.map(s => s.value.accesses).reduce((a, b) => a + b, 0)
    expect(dayAccesses).toEqual(eventCnt)
    events = await eventDAL.getAll()
    for await (const event of events) {
      const event_d = DateTime.fromMillis(event.value.timestamp)
      let eventFound = false
      dayStats.series.forEach(s => {
        const series_d = DateTime.fromISO(s.date)
        if(series_d < event_d && event_d < series_d.plus({day: 1})) {
          expect(Object.keys(s.value.accessesByProgramId)?.find(s => s === event.value.signer)).toBeDefined()
          eventFound = true
        }
      })
      expect(eventFound).toBe(true)
    }

    // Check week stats
    const weekStats = await accountStats.getTimeSeriesStats('access', {
      timeFrame: TimeFrame.Week
    })
    expect(weekStats.series.length).toBeGreaterThan(0)
    const weekAccesses = weekStats.series.map(s => s.value.accesses).reduce((a, b) => a + b, 0)
    expect(weekAccesses).toEqual(eventCnt)
    events = await eventDAL.getAll()
    for await (const event of events) {
      const event_d = DateTime.fromMillis(event.value.timestamp)
      let eventFound = false
      weekStats.series.forEach(s => {
        const series_d = DateTime.fromISO(s.date)
        if(series_d < event_d && event_d < series_d.plus({week: 1})) {
          expect(Object.keys(s.value.accessesByProgramId)?.find(s => s === event.value.signer)).toBeDefined()
          eventFound = true
        }
      })
      expect(eventFound).toBe(true)
    }

    // Check month stats
    const monthStats = await accountStats.getTimeSeriesStats('access', {
      timeFrame: TimeFrame.Month
    })
    expect(monthStats.series.length).toBeGreaterThan(0)
    const monthAccesses = monthStats.series.map(s => s.value.accesses).reduce((a, b) => a + b, 0)
    expect(monthAccesses).toEqual(eventCnt)
    events = await eventDAL.getAll()
    for await (const event of events) {
      const event_d = DateTime.fromMillis(event.value.timestamp)
      let eventFound = false
      monthStats.series.forEach(s => {
        const series_d = DateTime.fromISO(s.date)
        if(series_d < event_d && event_d < series_d.plus({month: 1})) {
          expect(Object.keys(s.value.accessesByProgramId)?.find(s => s === event.value.signer)).toBeDefined()
          eventFound = true
        }
      })
      expect(eventFound).toBe(true)
    }
  })
})
`
  return [
    timeSeries,
    timeSeriesAggregator,
    statsAggregator,
    mockDAL,
    mockIndexer,
    timeSeriesTest,
  ]
}
