import { BlockchainId } from '@aleph-indexer/framework'
import { PublicKey } from '@solana/web3.js'

export type AlephEvent = {
  blockchain: BlockchainId
  id: string
  timestamp: number
  height: number
  address: string
  transaction: string
}

export type MessageEvent = AlephEvent & {
  type: string
  content: string
}

export type SyncEvent = AlephEvent & {
  message: string
}

export enum EventType {
  Sync = 'SyncEvent(uint256,address,string)',
  Message = 'MessageEvent(uint256,address,string,string)',
}

export type MessageEventQueryArgs = {
  // @todo: Implement this query filters
  // address?: string
  // types?: string[]
  blockchain: BlockchainId
  startDate?: number
  endDate?: number
  startHeight?: number
  endHeight?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type SyncEventQueryArgs = MessageEventQueryArgs

export type SolanaMessage = {
  address: PublicKey
  msgtype: string
  msgcontent: string
}

export type SolanaMessageEvent = {
  name: string
  data: SolanaMessage
}

export type SolanaMessageSync = {
  address: PublicKey
  message: string
}

export type SolanaMessageSyncEvent = {
  name: string
  data: SolanaMessageSync
}

export type SolanaEvents = SolanaMessageEvent | SolanaMessageSyncEvent

export type AlephSolanaContract = {
  version: '0.1.0'
  name: 'aleph_solana_contract'
  instructions: [
    {
      name: 'doEmit'
      accounts: [
        {
          name: 'sender'
          isMut: true
          isSigner: true
        },
      ]
      args: [
        {
          name: 'message'
          type: 'string'
        },
      ]
    },
    {
      name: 'doMessage'
      accounts: [
        {
          name: 'sender'
          isMut: true
          isSigner: true
        },
      ]
      args: [
        {
          name: 'msgtype'
          type: 'string'
        },
        {
          name: 'msgcontent'
          type: 'string'
        },
      ]
    },
  ]
  events: [
    {
      name: 'SyncEvent'
      fields: [
        {
          name: 'address'
          type: 'publicKey'
          index: false
        },
        {
          name: 'message'
          type: 'string'
          index: false
        },
      ]
    },
    {
      name: 'MessageEvent'
      fields: [
        {
          name: 'address'
          type: 'publicKey'
          index: false
        },
        {
          name: 'msgtype'
          type: 'string'
          index: false
        },
        {
          name: 'msgcontent'
          type: 'string'
          index: false
        },
      ]
    },
  ]
}
