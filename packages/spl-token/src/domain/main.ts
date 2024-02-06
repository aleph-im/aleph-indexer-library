import {
  AccountIndexerRequestArgs,
  BlockchainChain,
  IndexerMainDomain,
  IndexerMainDomainContext,
  IndexerMainDomainWithDiscovery,
} from '@aleph-indexer/framework'
import {
  getTokenByAddress,
  getTokenMintByAccount,
  solanaPrivateRPCRoundRobin,
} from '@aleph-indexer/solana'
import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenEvent,
  SPLTokenInfo,
  SPLTokenType,
} from '../types.js'
import {
  AccountHoldingsFilters,
  MintEventsFilters,
  TokenHoldersFilters,
} from './types.js'
import { discoveryFn } from '../utils/discovery.js'
import { TOKEN_PROGRAM_ID } from '../constants.js'

export default class MainDomain
  extends IndexerMainDomain
  implements IndexerMainDomainWithDiscovery
{
  protected tokens: Record<string, SPLTokenInfo> = {}

  constructor(protected context: IndexerMainDomainContext) {
    super(context, {})
  }

  async discoverAccounts(): Promise<AccountIndexerRequestArgs[]> {
    const init = {
      blockchainId: BlockchainChain.Solana,
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
    await super.init(...args)

    // TODO: create mint databases

    const { accounts, mints } = await discoveryFn()
    await Promise.all(
      accounts.map(async (account: string) => {
        const connection = solanaPrivateRPCRoundRobin.getClient()
        const mint = await getTokenMintByAccount(
          account,
          connection.getConnection(),
        )
        await this.addToken(mint)

        const options = {
          account,
          meta: { type: SPLTokenType.Account, mint: mint },
          index: {
            transactions: {
              chunkDelay: 0,
              chunkTimeframe: 1000 * 60 * 60 * 24,
            },
            content: false,
          },
        }
        await this.context.apiClient
          .useBlockchain(BlockchainChain.Solana)
          .indexAccount(options)
        this.accounts.solana.add(account)
      }),
    )
    await Promise.all(
      mints.map(async (mint: string) => {
        await this.addToken(mint)
        const options = {
          account: mint,
          meta: { type: SPLTokenType.Mint, mint },
          index: {
            transactions: {
              chunkDelay: 0,
              chunkTimeframe: 1000 * 60 * 60 * 24,
            },
            content: false,
          },
        }
        await this.context.apiClient
          .useBlockchain(BlockchainChain.Solana)
          .indexAccount(options)
        this.accounts.solana.add(mint)
      }),
    )
  }

  async getTokens(): Promise<Record<string, SPLTokenInfo>> {
    return this.tokens
  }

  async getTokenHolders(
    account: string,
    filters: TokenHoldersFilters,
  ): Promise<SPLAccountBalance[]> {
    return (await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        args: [filters],
        method: 'getTokenHolders',
      })) as SPLAccountBalance[]
  }

  async getMintEvents(
    account: string,
    filters: MintEventsFilters,
  ): Promise<SPLTokenEvent[]> {
    return (await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        args: [filters],
        method: 'getMintEvents',
      })) as SPLTokenEvent[]
  }

  async getAccountHoldings(
    account: string,
    filters: AccountHoldingsFilters,
  ): Promise<SPLAccountHoldings[]> {
    return (await this.context.apiClient
      .useBlockchain(BlockchainChain.Solana)
      .invokeDomainMethod({
        account,
        args: [filters],
        method: 'getAccountHoldings',
      })) as SPLAccountHoldings[]
  }

  protected async addToken(mint: string): Promise<void> {
    const connection = solanaPrivateRPCRoundRobin.getClient()
    const tokenInfo = await getTokenByAddress(mint, connection.getConnection())
    if (!tokenInfo) return

    const entity: SPLTokenInfo = {
      name: tokenInfo.symbol,
      address: mint,
      programId: TOKEN_PROGRAM_ID,
      tokenInfo,
    }

    this.tokens[mint] = entity
  }
}
