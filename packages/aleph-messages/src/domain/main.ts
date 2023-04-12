import { Blockchain } from '@aleph-indexer/framework'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  MessageEvent,
  MessageEventQueryArgs,
  SyncEvent,
  SyncEventQueryArgs,
} from '../types.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    await this.indexAccounts([
      {
        blockchainId: Blockchain.Ethereum,
        account: '0x166fd4299364B21c7567e163d85D78d2fb2f8Ad5',
        index: { logs: true },
      },
      {
        blockchainId: Blockchain.Bsc,
        account: '0xdF270752C8C71D08acbae4372687DA65AECe2D5D',
        index: { logs: true },
      },
      {
        blockchainId: Blockchain.Solana,
        account: 'ALepH1n9jxScbz45aZhBYVa35zxBNbKSvL6rWQpb4snc',
        index: { transactions: true },
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
