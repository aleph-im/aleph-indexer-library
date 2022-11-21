import {
  IndexerMainDomain,
  IndexerMainDomainWithDiscovery,
  IndexerMainDomainWithStats,
  IndexerMainDomainContext,
} from '@aleph-indexer/framework'
import { SPLTokenType } from '../types.js'
import { DiscovererFactory } from './discoverer/index.js'
import { discoveryFn } from '../utils/discovery'

export default class MainDomain
  extends IndexerMainDomain
  implements IndexerMainDomainWithDiscovery, IndexerMainDomainWithStats
{
  protected accounts: Set<string> = new Set()
  protected mints: Set<string> = new Set()

  constructor(
    protected context: IndexerMainDomainContext,
    protected discovererFactory: typeof DiscovererFactory = DiscovererFactory,
  ) {
    super(context, {
      stats: 1000 * 60 * 5,
    })
  }

  async init(...args: unknown[]): Promise<void> {
    super.init(...args)
    const { accounts, mints } = await discoveryFn()

    await Promise.all(
      accounts.map(async (account: string) => {
        const options = {
          account,
          meta: { type: SPLTokenType.Account },
          index: {
            transactions: {
              chunkDelay: 0,
              chunkTimeframe: 1000 * 60 * 60 * 24,
            },
            content: false,
          },
        }
        await this.context.apiClient.indexAccount(options)
        this.accounts.add(account)
      }),
    )
    await Promise.all(
      mints.map(async (mint: string) => {
        const options = {
          account: mint,
          meta: { type: SPLTokenType.Mint },
          index: {
            transactions: {
              chunkDelay: 0,
              chunkTimeframe: 1000 * 60 * 60 * 24,
            },
            content: false,
          },
        }
        await this.context.apiClient.indexAccount(options)
        this.mints.add(mint)
      }),
    )
  }
}
