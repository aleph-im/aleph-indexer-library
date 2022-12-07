import { ViewInstructions } from './types.js'

export function renderSrcFiles(
  Name: string,
  filename: string,
  instructionsView: ViewInstructions | undefined,
  address?: string,
): string[] {
  const NAME = filename.toUpperCase()
  const name = filename.toLowerCase()

  let constants = ''
  let types = ''

  if (instructionsView) {
    constants = `import { PublicKey } from '@solana/web3.js'
import { config } from '@aleph-indexer/core'

export enum ProgramName {
  ${Name} = '${name}',
}

const DAY = 1000 * 60 * 60 * 24
const START_DATE = Date.now()
const SINCE_DATE = START_DATE - 7 * DAY
export const DOMAIN_CACHE_START_DATE = config.INDEX_START_DATE
  ? Number(config.INDEX_START_DATE)
  : SINCE_DATE
`
    if (address) {
      constants += `
export const ${NAME}_PROGRAM_ID = '${address}'
export const ${NAME}_PROGRAM_ID_PK = new PublicKey(${NAME}_PROGRAM_ID)
`
    } else {
      constants += `
export const ${NAME}_PROGRAM_ID = 'WRITE YOUR PROGRAM PUBKEY HERE'
export const ${NAME}_PROGRAM_ID_PK = new PublicKey(${NAME}_PROGRAM_ID)
`
    }

    types += `import { AccountType, ParsedEvents, ParsedAccountsData } from './utils/layouts/index.js'

export type ${Name}AccountInfo = {
  name: string
  programId: string
  address: string
  type: AccountType
  data: ParsedAccountsData
}

// -------------------------- STATS --------------------------

export type AccessTimeStats = {
  /**
   * Total number of times the account was accessed
   */
  accesses: number
  /**
   * Number of times accessed, grouped by program ID
   */
  accessesByProgramId: {
    [programId: string]: number
  }
  /**
   * First access time in milliseconds digested in the stats
   */
  startTimestamp?: number
  /**
   * Last access time in milliseconds digested in the stats
   */
  endTimestamp?: number
}

export type TimeStats =
  | AccessTimeStats  //@note: Add more types of time stats here

export type ${Name}AccountStats = {
  requestsStatsByHour: Record<string, AccessTimeStats>
  last1h: AccessTimeStats
  last24h: AccessTimeStats
  last7d: AccessTimeStats
  total: AccessTimeStats
  accessingPrograms: Set<string>
  lastRequest?: ParsedEvents
}

export type HourlyStats = {
  stats: AccessTimeStats[]
  statsMap: Record<string, AccessTimeStats>
}

export type Global${Name}Stats = {
  totalAccounts: Record<AccountType, number>
  totalAccesses: number
  totalAccessesByProgramId: {
    [programId: string]: number
  }
  startTimestamp?: number
  endTimestamp?: number
}

export type ${Name}AccountData = {
  info: ${Name}AccountInfo
  stats?: ${Name}AccountStats
}
`
  }
  return [constants, types]
}
