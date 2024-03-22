import {
  IndexerMainDomain,
  IndexerMainDomainWithDiscovery,
  IndexerMainDomainWithStats,
  AccountIndexerConfigWithMeta,
  IndexerMainDomainContext,
  AccountStats,
  BlockchainChain,
} from '@aleph-indexer/framework'
import { AccountType, MarinadeFinanceEvent } from '../utils/layouts/index.js'
import {
  GlobalMarinadeFinanceStats,
  MarinadeFinanceAccountStats,
  MarinadeFinanceAccountData,
  MarinadeFinanceAccountInfo,
} from '../types.js'
import MarinadeFinanceDiscoverer from './discoverer/marinade-finance.js'
import { EventsFilters } from '../api/resolvers.js'

export default class MainDomain
  extends IndexerMainDomain
  implements IndexerMainDomainWithDiscovery, IndexerMainDomainWithStats
{
  protected stats!: GlobalMarinadeFinanceStats

  constructor(
    protected context: IndexerMainDomainContext,
    protected discoverer: MarinadeFinanceDiscoverer = new MarinadeFinanceDiscoverer(),
  ) {
    super(context, {
      discoveryInterval: 1000 * 60 * 60 * 1,
      stats: 1000 * 60 * 1,
    })
  }

  async discoverAccounts(): Promise<
    AccountIndexerConfigWithMeta<MarinadeFinanceAccountInfo>[]
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
  ): Promise<Record<string, MarinadeFinanceAccountData>> {
    const accounts: Record<string, MarinadeFinanceAccountData> = {}

    await Promise.all(
      Array.from(this.accounts.solana || []).map(async (account) => {
        const actual = await this.getAccount(account, includeStats)
        accounts[account] = actual as MarinadeFinanceAccountData
      }),
    )

    return accounts
  }

  async getAccount(
    account: string,
    includeStats?: boolean,
  ): Promise<MarinadeFinanceAccountData> {
    const info = (await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        method: 'getAccountInfo',
      })) as MarinadeFinanceAccountInfo

    if (!includeStats) return { info }

    const { stats } = (await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        method: 'getMarinadeFinanceStats',
      })) as AccountStats<MarinadeFinanceAccountStats>

    return { info, stats }
  }

  async getAccountEvents(args: EventsFilters): Promise<MarinadeFinanceEvent[]> {
    const response = await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account: args.account,
        method: 'getAccountEvents',
        args: [args],
      })

    return response as MarinadeFinanceEvent[]
  }

  async updateStats(now: number): Promise<void> {
    this.stats = await this.computeGlobalStats()
  }

  async getGlobalStats(
    addresses?: string[],
  ): Promise<GlobalMarinadeFinanceStats> {
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
  ): Promise<GlobalMarinadeFinanceStats> {
    console.log(
      `📊 computing global stats for ${accountAddresses?.length} accounts`,
    )
    const accountsStats =
      await this.getAccountStats<MarinadeFinanceAccountStats>(
        BlockchainChain.Solana,
        accountAddresses,
      )

    const globalStats: GlobalMarinadeFinanceStats = this.getNewGlobalStats()

    for (const accountStats of accountsStats) {
      if (!accountStats.stats) continue

      const { accesses, accessesByProgramId, startTimestamp, endTimestamp } =
        accountStats.stats.total

      console.log(
        `📊 computing global stats for ${accountStats.account} with ${accesses} accesses`,
      )

      const type = this.discoverer.getAccountType(accountStats.account)

      globalStats.totalAccounts[type]++
      globalStats.totalAccesses += accesses || 0
      if (accessesByProgramId) {
        Object.entries(accessesByProgramId).forEach(([programId, accesses]) => {
          globalStats.totalAccessesByProgramId[programId] =
            (globalStats.totalAccessesByProgramId[programId] || 0) + accesses
        })
      }
      globalStats.startTimestamp = Math.min(
        globalStats.startTimestamp || Number.MAX_SAFE_INTEGER,
        startTimestamp || Number.MAX_SAFE_INTEGER,
      )
      globalStats.endTimestamp = Math.max(
        globalStats.endTimestamp || 0,
        endTimestamp || 0,
      )
    }
    return globalStats
  }

  getNewGlobalStats(): GlobalMarinadeFinanceStats {
    return {
      totalAccesses: 0,
      totalAccounts: {
        [AccountType.TicketAccountData]: 0,
        [AccountType.State]: 0,
      },
      totalAccessesByProgramId: {},
      startTimestamp: undefined,
      endTimestamp: undefined,
    }
  }
}
