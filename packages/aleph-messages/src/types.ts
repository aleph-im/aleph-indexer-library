import { Blockchain } from '@aleph-indexer/framework'

export type AlephEvent = {
  blockchain: Blockchain
  id: string
  timestamp: number
  height: number
  address: string
  transaction: string
}

export type MessageEvent = AlephEvent & {
  type: string
  content: object
}

export type SyncEvent = AlephEvent & {
  message: object
}

export enum EventType {
  Sync = 'SyncEvent(uint256,address,string)',
  Message = 'MessageEvent(uint256,address,string,string)',
}

export type MessageEventQueryArgs = {
  // @todo: Implement this query filters
  // address?: string
  // types?: string[]
  blockchain: Blockchain
  startDate?: number
  endDate?: number
  startHeight?: number
  endHeight?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type SyncEventQueryArgs = MessageEventQueryArgs
