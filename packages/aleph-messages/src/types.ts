export type MessageEvent = {
  id: string
  timestamp: number
  height: number
  address: string
  type: string
  content: string | object
}

export type SyncEvent = {
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
  // address?: string
  // types?: string[]
  startDate?: number
  endDate?: number
  startHeight?: number
  endHeight?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type SyncEventQueryArgs = MessageEventQueryArgs
