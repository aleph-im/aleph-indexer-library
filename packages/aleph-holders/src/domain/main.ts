import { BlockchainChain } from '@aleph-indexer/framework'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  Balance,
  BalanceQueryArgs,
  ERC20TransferEvent,
  ERC20TransferEventQueryArgs,
} from '../types.js'
import { blockchainTokenContract } from '../utils/index.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    await this.indexAccounts([
      {
        blockchainId: BlockchainChain.Ethereum,
        account: blockchainTokenContract[BlockchainChain.Ethereum],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.Avalanche,
        account: blockchainTokenContract[BlockchainChain.Avalanche],
        index: { logs: true },
      },
      // {
      //   blockchainId: BlockchainChain.Base,
      //   account: blockchainTokenContract[BlockchainChain.Base],
      //   index: { logs: true },
      // },
      // {
      //   blockchainId: BlockchainChain.Bsc,
      //   account: blockchainTokenContract[BlockchainChain.Bsc],
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
