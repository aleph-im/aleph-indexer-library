import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  Balance,
  BalanceQueryArgs,
  ERC20TransferEvent,
  ERC20TransferEventQueryArgs,
} from '../types.js'
import { getTokenAccounts } from '../utils/index.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    const accounts = getTokenAccounts().map((account) => {
      return {
        blockchainId: account.blockchain,
        account: account.contract,
        index: { logs: true },
        meta: account,
      }
    })

    console.log('🟢 Indexing tokens: ', accounts)

    await this.indexAccounts(accounts)
  }

  async getEvents(
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getEvents',
        args: [args],
      })

    return response as ERC20TransferEvent[]
  }

  async getBalances(args: BalanceQueryArgs): Promise<Balance[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getBalances',
        args: [args],
      })

    return response as Balance[]
  }
}
