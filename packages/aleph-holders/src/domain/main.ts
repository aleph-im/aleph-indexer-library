import { BlockchainChain } from '@aleph-indexer/framework'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  ERC20Balance,
  CommonBalanceQueryArgs,
  ERC20TransferEvent,
  ERC20TransferEventQueryArgs,
  StreamFlowUpdatedEvent,
  StreamFlowUpdatedEventQueryArgs,
  StreamBalance,
  StreamBalanceQueryArgs,
  ERC20BalanceQueryArgs,
} from '../types.js'
import {
  blockchainSuperfluidCFAContract,
  blockchainTokenContract,
} from '../utils/index.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    await this.indexAccounts([
      {
        blockchainId: BlockchainChain.Avalanche,
        account: blockchainTokenContract[BlockchainChain.Avalanche],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.Avalanche,
        account: blockchainSuperfluidCFAContract[BlockchainChain.Avalanche],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.Base,
        account: blockchainTokenContract[BlockchainChain.Base],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.Base,
        account: blockchainSuperfluidCFAContract[BlockchainChain.Base],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.Ethereum,
        account: blockchainTokenContract[BlockchainChain.Ethereum],
        index: { logs: true },
      },
      // {
      //   blockchainId: BlockchainChain.Bsc,
      //   account: blockchainTokenContract[BlockchainChain.Bsc],
      //   index: { logs: true },
      // },
    ])
  }

  async getTransferEvents(
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    const { blockchain } = args
    const alephTokenCotract = blockchainTokenContract[blockchain]

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenCotract,
        method: 'getTransferEvents',
        args: [args],
      })

    return response as ERC20TransferEvent[]
  }

  async getFlowUpdatedEvents(
    args: StreamFlowUpdatedEventQueryArgs,
  ): Promise<StreamFlowUpdatedEvent[]> {
    const { blockchain } = args
    const superfluidCFACotract = blockchainSuperfluidCFAContract[blockchain]

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: superfluidCFACotract,
        method: 'getFlowUpdatedEvents',
        args: [args],
      })

    return response as StreamFlowUpdatedEvent[]
  }

  async getERC20Balances(args: ERC20BalanceQueryArgs): Promise<ERC20Balance[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getERC20Balances',
        args: [args],
      })

    return response as ERC20Balance[]
  }

  async getStreamBalances(
    args: StreamBalanceQueryArgs,
  ): Promise<StreamBalance[]> {
    const { blockchain } = args
    const superfluidCFACotract = blockchainSuperfluidCFAContract[blockchain]

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: superfluidCFACotract,
        method: 'getStreamBalances',
        args: [args],
      })

    return response as StreamBalance[]
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<ERC20Balance[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getBalances',
        args: [args],
      })

    return response as ERC20Balance[]
  }
}
