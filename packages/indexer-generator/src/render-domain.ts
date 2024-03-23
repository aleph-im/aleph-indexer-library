import { ViewAccounts } from './types.js'

export function renderDomainFiles(
  Name: string,
  filename: string,
  accounts: ViewAccounts | undefined,
): [string, string][] {
  const files: [string, string][] = []

  files.push(['account', createAccountDomain(Name)])
  files.push(['worker', createWorkerDomain(Name, filename)])
  files.push(['main', createMainDomain(Name, accounts)])
  files.push(['discoverer', createDiscovererFile(Name, filename)])

  return files
}

function createAccountDomain(Name: string): string {
  return `import {
  AccountTimeSeriesStatsManager,
  AccountTimeSeriesStats,
  AccountStatsFilters,
  AccountStats,
} from '@aleph-indexer/framework'
import { EventDALIndex, EventStorage } from '../dal/event.js'
import { ${Name}Event } from '../utils/layouts/index.js'
import { ${Name}AccountInfo, ${Name}AccountStats } from '../types.js'
import { EventsFilters } from '../api/resolvers.js'

export class AccountDomain {
  constructor(
    public info: ${Name}AccountInfo,
    protected eventDAL: EventStorage,
    protected timeSeriesStats: AccountTimeSeriesStatsManager<${Name}AccountStats>,
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

  async getStats(): Promise<AccountStats<${Name}AccountStats>> {
    return this.timeSeriesStats.getStats()
  }

  async getEvents(
    args: EventsFilters
  ): Promise<${Name}Event[]> {
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
    const from = startDate ? [this.info.address, startDate] : [this.info.address, 0]
    const to = endDate ? [this.info.address, endDate] : [this.info.address, Date.now()]
    let sk = skip

    const result: ${Name}Event[] = []
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
`
}

function createWorkerDomain(Name: string, filename: string): string {
  const NAME = filename.toUpperCase().replace(/-/g, '_')

  return `import {
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
import { ${Name}Event } from '../utils/layouts/index.js'
import { ${Name}AccountStats, ${Name}AccountInfo } from '../types.js'
import { AccountDomain } from './account.js'
import { createAccountStats } from './stats/timeSeries.js'
import { ${NAME}_PROGRAM_ID } from '../constants.js'
import { EventsFilters } from '../api/resolvers.js'

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
    protected programId = ${NAME}_PROGRAM_ID,
  ) {
    super(context)
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<${Name}AccountInfo>,
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

    this.accounts[account] = new AccountDomain(meta, this.eventDAL, accountTimeSeries)

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

  async getStats(account: string): Promise<AccountStats<${Name}AccountStats>> {
    return this.getAccountStats(account)
  }

  async solanaFilterInstruction(
    context: ParserContext,
    entity: SolanaParsedInstructionContext,
  ): Promise<boolean> {
    return (
      isParsedIx(entity.instruction) &&
      entity.instruction.programId === this.programId
    )
  }

  async solanaIndexInstructions(
    context: ParserContext,
    ixsContext: SolanaParsedInstructionContext[],
  ): Promise<void> {
    const parsedIxs = ixsContext.map((ix) =>
      this.eventParser.parse(ix, context.account),
    )
    console.log(\`indexing \${ixsContext.length} parsed ixs\`)

    await this.eventDAL.save(parsedIxs)
  }

  // ------------- Custom impl methods -------------------

  async getAccountInfo(actual: string): Promise<${Name}AccountInfo> {
    const res = this.getAccount(actual)
    return res.info
  }

  async getAccountStats(actual: string): Promise<AccountStats<${Name}AccountStats>> {
    const res = this.getAccount(actual)
    return res.getStats()
  }

  async getAccountEvents(
    account: string,
    args: EventsFilters
  ): Promise<${Name}Event[]> {
    const res = this.getAccount(account)
    return await res.getEvents(args)
  }

  private getAccount(account: string): AccountDomain {
    const accountInstance = this.accounts[account]
    if (!accountInstance) throw new Error(\`Account \${account} does not exist\`)
    return accountInstance
  }
}
`
}

function createMainDomain(
  Name: string,
  accounts: ViewAccounts | undefined,
): string {
  let mainDomain = `import {
  IndexerMainDomain,
  IndexerMainDomainWithDiscovery,
  IndexerMainDomainWithStats,
  AccountIndexerConfigWithMeta,
  IndexerMainDomainContext,
  AccountStats,
  BlockchainChain,
} from '@aleph-indexer/framework'
import { `

  if (accounts) mainDomain += `AccountType, `
  mainDomain += `${Name}Event } from '../utils/layouts/index.js'
import {
  Global${Name}Stats,
  ${Name}AccountStats,
  ${Name}AccountData,
  ${Name}AccountInfo,
} from '../types.js'
import AccountDiscoverer from './discoverer.js'
import { EventsFilters } from '../api/resolvers.js'

export default class MainDomain
  extends IndexerMainDomain
  implements IndexerMainDomainWithDiscovery, IndexerMainDomainWithStats
{
  protected stats!: Global${Name}Stats

  constructor(
    protected context: IndexerMainDomainContext,
    protected discoverer: AccountDiscoverer = new AccountDiscoverer(),
  ) {
    super(context, {
      discoveryInterval: 1000 * 60 * 60 * 1,
      stats: 1000 * 60 * 1,
    })
  }

  async discoverAccounts(): Promise<
    AccountIndexerConfigWithMeta<${Name}AccountInfo>[]
  > {
    const accounts = await this.discoverer.loadAccounts()

    return accounts.map((meta) => {
      return {
        blockchainId: BlockchainChain.Solana,
        account: meta.address,
        meta,
        index: {
          transactions: true,
          content: false,
        },
      }
    })
  }

  async getAccounts(
    includeStats?: boolean,
  ): Promise<Record<string, ${Name}AccountData>> {
    const accounts: Record<string, ${Name}AccountData> = {}

    await Promise.all(
      Array.from(this.accounts.solana || []).map(async (account) => {
        const actual = await this.getAccount(account, includeStats)
        accounts[account] = actual as ${Name}AccountData
      }),
    )

    return accounts
  }

  async getAccount(
    account: string,
    includeStats?: boolean,
  ): Promise<${Name}AccountData> {
    const info = (await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        method: 'getAccountInfo',
      })) as ${Name}AccountInfo

    if (!includeStats) return { info }

    const { stats } = (await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        method: 'get${Name}Stats',
      })) as AccountStats<${Name}AccountStats>

    return { info, stats }
  }

  async getAccountEvents(args: EventsFilters): Promise<${Name}Event[]> {
    // note: use primitive/simple types using invokeDomainMethod
    const response = await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account: args.account,
        method: 'getAccountEvents',
        args: [args],
      })

    return response as ${Name}Event[]
  }

  async updateStats(now: number): Promise<void> {
    this.stats = await this.computeGlobalStats()
  }

  async getGlobalStats(addresses?: string[]): Promise<Global${Name}Stats> {
    if (!addresses || addresses.length === 0) {
      if (!this.stats) {
        await this.updateStats(Date.now())
      }

      return this.stats
    }

    return this.computeGlobalStats(addresses)
  }

  async computeGlobalStats(
    accountAddresses?: string[],
  ): Promise<Global${Name}Stats> {
    console.log(\`📊 computing global stats for \${accountAddresses?.length} accounts\`)
    const accountsStats = await this.getAccountStats<${Name}AccountStats>(
      BlockchainChain.Solana,
      accountAddresses,
    )

    const globalStats: Global${Name}Stats = this.getNewGlobalStats()

    for (const accountStats of accountsStats) {
      if (!accountStats.stats) continue

      const { accesses, accessesByProgramId, startTimestamp, endTimestamp } = accountStats.stats.total

      console.log(\`📊 computing global stats for \${accountStats.account} with \${accesses} accesses\`)

      const type = this.discoverer.getAccountType(accountStats.account)

      globalStats.totalAccounts[type]++
      globalStats.totalAccesses += accesses || 0
      if(accessesByProgramId) {
        Object.entries(accessesByProgramId).forEach(([programId, accesses]) => {
          globalStats.totalAccessesByProgramId[programId] =
            (globalStats.totalAccessesByProgramId[programId] || 0) + accesses
        })
      }
      globalStats.startTimestamp = Math.min(
        globalStats.startTimestamp || Number.MAX_SAFE_INTEGER, startTimestamp || Number.MAX_SAFE_INTEGER,
      )
      globalStats.endTimestamp = Math.max(
        globalStats.endTimestamp || 0, endTimestamp || 0,
      )

    }
    return globalStats
  }

  getNewGlobalStats(): Global${Name}Stats {
    return {
      totalAccesses: 0,
      totalAccounts: {`
  if (accounts) {
    for (const account of accounts) {
      mainDomain += `
        [AccountType.${account.name}]: 0,`
    }
  }
  mainDomain += `
      },
      totalAccessesByProgramId: {},
      startTimestamp: undefined,
      endTimestamp: undefined,
    }
  }
}
`
  return mainDomain
}

function createDiscovererFile(Name: string, filename: string): string {
  const NAME = filename.toUpperCase().replace(/-/g, '_')

  return `import {
    ${NAME}_PROGRAM_ID,
    ${NAME}_PROGRAM_ID_PK,
} from '../constants.js'
import { AccountType } from '../utils/layouts/index.js'
import { ${Name}AccountInfo } from '../types.js'
import {
    ACCOUNT_DISCRIMINATOR,
    ACCOUNTS_DATA_LAYOUT,
} from '../utils/layouts/accounts.js'
import { solanaPrivateRPC } from '@aleph-indexer/solana'
import bs58 from 'bs58'
import { AccountInfo, PublicKey } from '@solana/web3.js'

export default class AccountDiscoverer {
    constructor(
        public accountTypes: Set<AccountType> = new Set(Object.values(AccountType)),
        protected cache: Record<string, ${Name}AccountInfo> = {},
    ) {}

    async loadAccounts(): Promise<${Name}AccountInfo[]> {
        const newAccounts:${Name}AccountInfo[] = []
        const accounts = await this.getAllAccounts()

        for (const accountInfo of accounts) {
            if (this.cache[accountInfo.address]) continue
    
            this.cache[accountInfo.address] = accountInfo
            newAccounts.push(this.cache[accountInfo.address])
        }

        return newAccounts
    }

    getAccountType(address: string): AccountType {
        return this.cache[address].type
    }

  /**
   * Fetches all accounts from the program. Useful to filter which accounts should be indexed.
   */
    async getAllAccounts(): Promise<${Name}AccountInfo[]> {
        const connection = solanaPrivateRPC.getConnection()
        const accountsInfo: ${Name}AccountInfo[] = []
        // todo: If you want to only index a subset of account types, you can filter them here
        const accountTypesToFilter: AccountType[] = [/*AccountType.*/]
        for (const type of this.accountTypes) {
          if (accountTypesToFilter.includes(type)) continue
            const accounts = await connection.getProgramAccounts(
              ${NAME}_PROGRAM_ID_PK,
              {
                filters: [
                  {
                    memcmp: {
                      bytes: bs58.encode(ACCOUNT_DISCRIMINATOR[type]),
                      offset: 0,
                    },
                  },
                ],
              },
            )
            accounts.map(
                (value: { pubkey: PublicKey; account: AccountInfo<Buffer> }) => {
                  const accountInfo = this.deserializeAccountResponse(value, type)
                  if (accountInfo) accountsInfo.push(accountInfo)
                }
            )
        }
        return accountsInfo
    }

    deserializeAccountResponse(
        resp: { pubkey: PublicKey; account: AccountInfo<Buffer> },
        type: AccountType,
    ): ${Name}AccountInfo | undefined {
      try {
        const data = ACCOUNTS_DATA_LAYOUT[type].deserialize(resp.account.data)[0]
        const address = resp.pubkey.toBase58()

        return {
            programId: ${NAME}_PROGRAM_ID,
            type,
            address: address,
            ...data,
          }
      } catch (e) {
        // layout changed on program update?
        console.log('Error parsing account', e)
        return
      }
    }
}
`
}
