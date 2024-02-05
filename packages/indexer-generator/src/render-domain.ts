import { ViewAccounts } from './types.js'

export function renderDomainFiles(
  Name: string,
  filename: string,
  accounts: ViewAccounts | undefined,
): [string, string][] {
  const files: [string, string][] = [];

  files.push(['account', createAccountDomain(Name)]);
  files.push(['worker', createWorkerDomain(Name, filename)]);
  files.push(['main', createMainDomain(Name, filename, accounts)]);

  return files;
}

function createAccountDomain(Name: string): string {
  return `import { StorageStream } from '@aleph-indexer/core'
import {
  AccountTimeSeriesStatsManager,
  AccountTimeSeriesStats,
  AccountStatsFilters,
  AccountStats,
} from '@aleph-indexer/framework'
import { EventDALIndex, EventStorage } from '../dal/event.js'
import { ${Name}Event } from '../utils/layouts/index.js'
import { ${Name}AccountInfo, ${Name}AccountStats } from '../types.js'

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

  async getEventsByTime(
    startDate: number,
    endDate: number,
    opts: any,
  ): Promise<StorageStream<string, ${Name}Event>> {
    return await this.eventDAL
      .useIndex(EventDALIndex.AccountTimestamp)
      .getAllFromTo(
        [this.info.address, startDate],
        [this.info.address, endDate],
        opts,
      )
  }
}
`
}

function createWorkerDomain(Name: string, filename: string): string {
  const NAME = filename.toUpperCase().replace(/-/g, "_");

  return `import { StorageStream } from '@aleph-indexer/core'
import {
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
    if ('account' in context) {
      const parsedIxs = ixsContext.map((ix) =>
        this.eventParser.parse(ix, context.account),
      )
      console.log(\`indexing \${ixsContext.length} parsed ixs\`)

      await this.eventDAL.save(parsedIxs)
    }
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

  async getAccountEventsByTime(
    account: string,
    startDate: number,
    endDate: number,
    opts: any,
  ): Promise<StorageStream<string, ${Name}Event>> {
    const res = this.getAccount(account)
    return await res.getEventsByTime(startDate, endDate, opts)
  }

  private getAccount(account: string): AccountDomain {
    const accountInstance = this.accounts[account]
    if (!accountInstance) throw new Error(\`Account \${account} does not exist\`)
    return accountInstance
  }
}
`
}

function createMainDomain(Name: string, filename: string, accounts: ViewAccounts | undefined): string {
  let mainDomain = `import { StorageStream } from '@aleph-indexer/core'
import {
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
import ${Name}Discoverer from './discoverer/${filename}.js'

export default class MainDomain
  extends IndexerMainDomain
  implements IndexerMainDomainWithDiscovery, IndexerMainDomainWithStats
{
  protected stats!: Global${Name}Stats

  constructor(
    protected context: IndexerMainDomainContext,
    protected discoverer: ${Name}Discoverer = new ${Name}Discoverer(),
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
          transactions: {
            chunkDelay: 0,
            chunkTimeframe: 1000 * 60 * 60 * 24,
          },
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

  async getAccountEventsByTime(
    account: string,
    startDate: number,
    endDate: number,
    opts: any,
  ): Promise<StorageStream<string, ${Name}Event>> {
    const stream = await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        method: 'getAccountEventsByTime',
        args: [startDate, endDate, opts],
      })

    return stream as StorageStream<string, ${Name}Event>
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
  return mainDomain;
}