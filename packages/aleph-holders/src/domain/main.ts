import { BlockchainChain } from '@aleph-indexer/framework'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  Balance,
  BalanceQueryArgs,
  ERC20TransferEvent,
  ERC20TransferEventQueryArgs,
} from '../types.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    await this.indexAccounts([
      {
        blockchainId: BlockchainChain.Ethereum,
        account: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
        index: { logs: true },
      },
      // {
      //   blockchainId: BlockchainChain.Bsc,
      //   account: '0x82D2f8E02Afb160Dd5A480a617692e62de9038C4',
      //   index: { logs: true },
      // },
    ])
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
