import { Blockchain } from '@aleph-indexer/framework'

export type MessageEvent = {
  blockchain: Blockchain
  id: string
  timestamp: number
  height: number
  address: string
  type: string
  content: string | object
}

export type SyncEvent = {
  blockchain: Blockchain
  id: string
  timestamp: number
  height: number
  address: string
  message: string | object
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
