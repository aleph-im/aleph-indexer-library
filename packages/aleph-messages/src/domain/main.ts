import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  MessageEvent,
  MessageEventQueryArgs,
  SyncEvent,
  SyncEventQueryArgs,
} from '../types.js'
import { BlockchainChain, blockchainContract } from '../utils/index.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    await this.indexAccounts([
      {
        blockchainId: BlockchainChain.Ethereum,
        account: blockchainContract[BlockchainChain.Ethereum],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.Bsc,
        account: blockchainContract[BlockchainChain.Bsc],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.Solana,
        account: blockchainContract[BlockchainChain.Solana],
        index: { transactions: true },
      },
      {
        blockchainId: BlockchainChain.OasysTestnet,
        account: blockchainContract[BlockchainChain.OasysTestnet],
        index: { logs: true },
      },
      {
        blockchainId: BlockchainChain.HomeverseTestnet,
        account: blockchainContract[BlockchainChain.HomeverseTestnet],
        index: { logs: true },
      },
    ])
  }

  async getMessageEvents(args: MessageEventQueryArgs): Promise<MessageEvent[]> {
    const { blockchain } = args
    const [alephMessagesSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephMessagesSC,
        method: 'getMessageEvents',
        args: [args],
      })

    return response as MessageEvent[]
  }

  async getSyncEvents(args: SyncEventQueryArgs): Promise<SyncEvent[]> {
    const { blockchain } = args
    const [alephMessagesSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephMessagesSC,
        method: 'getSyncEvents',
        args: [args],
      })

    return response as SyncEvent[]
  }
}
