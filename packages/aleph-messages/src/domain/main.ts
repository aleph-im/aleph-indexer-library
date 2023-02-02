import { Blockchain } from '@aleph-indexer/framework'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  MessageEvent,
  MessageEventQueryArgs,
  SyncEvent,
  SyncEventQueryArgs,
} from '../types.js'

export default class MainDomain extends IndexerMainDomain {
  protected alephMessagesContract = '0x166fd4299364B21c7567e163d85D78d2fb2f8Ad5'

  async init(): Promise<void> {
    await super.init()

    await this.indexAccounts([
      {
        blockchainId: Blockchain.Ethereum,
        account: this.alephMessagesContract,
        meta: undefined,
        index: { logs: true },
      },
    ])
  }

  async getMessageEvents(args: MessageEventQueryArgs): Promise<MessageEvent[]> {
    const response = await this.context.apiClient
      .useBlockchain(Blockchain.Ethereum)
      .invokeDomainMethod({
        account: this.alephMessagesContract,
        method: 'getMessageEvents',
        args: [args],
      })

    return response as MessageEvent[]
  }

  async getSyncEvents(args: SyncEventQueryArgs): Promise<SyncEvent[]> {
    const response = await this.context.apiClient
      .useBlockchain(Blockchain.Ethereum)
      .invokeDomainMethod({
        account: this.alephMessagesContract,
        method: 'getSyncEvents',
        args: [args],
      })

    return response as SyncEvent[]
  }
}
