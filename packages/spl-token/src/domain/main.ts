import {
  AccountIndexerRequestArgs,
  IndexerMainDomain,
  IndexerMainDomainContext,
  IndexerMainDomainWithDiscovery,
  IndexerMainDomainWithStats,
} from '@aleph-indexer/framework'
import { SPLTokenInfo, SPLTokenType } from '../types.js'
import { discoveryFn } from '../utils/discovery.js'

export default class MainDomain
  extends IndexerMainDomain
  implements IndexerMainDomainWithDiscovery, IndexerMainDomainWithStats
{
  protected accounts: Set<string> = new Set()
  protected mints: Set<string> = new Set()

  constructor(protected context: IndexerMainDomainContext) {
    super(context, {
      stats: 1000 * 60 * 5,
    })
  }

  async updateStats(now: number): Promise<void> {
    console.log('Method not implemented.')
  }

  async discoverAccounts(): Promise<AccountIndexerRequestArgs[]> {
    const init = {
      account: '',
      index: {
        transactions: {
          chunkDelay: 0,
          chunkTimeframe: 1000 * 60 * 60 * 24,
        },
        content: false,
      },
    }
    return [init]
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

  async getTokens(): Promise<Record<string, SPLTokenInfo>> {
    const tokens: Record<string, SPLTokenInfo> = {}

    await Promise.all(
      Array.from(this.accounts || []).map(async (account) => {
        const token = await this.getToken(account)
        tokens[account] = token as SPLTokenInfo
      }),
    )

    return tokens
  }

  async getToken(account: string): Promise<SPLTokenInfo> {
    return (await this.context.apiClient.invokeDomainMethod({
      account,
      method: 'getToken',
    })) as SPLTokenInfo
  }
}
