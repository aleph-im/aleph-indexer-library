import { EntityStorage } from '@aleph-indexer/core'
import { MessageEvent } from '../types.js'

export type MessageEventStorage = EntityStorage<MessageEvent>

export enum MessageEventDALIndex {
  BlockchainTimestamp = 'blockchain_timestamp',
  BlockchainHeight = 'blockchain_height',
}

const idKey = {
  get: (e: MessageEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const blockchainKey = {
  get: (e: MessageEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: MessageEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: MessageEvent) => e.height,
  // @note: up to 10**9 [9 digits] enough for 300 years in ethereum
  length: 8,
}

export function createMessageEventDAL(path: string): MessageEventStorage {
  return new EntityStorage<MessageEvent>({
    name: 'message_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: MessageEventDALIndex.BlockchainTimestamp,
        key: [blockchainKey, timestampKey],
      },
      {
        name: MessageEventDALIndex.BlockchainHeight,
        key: [blockchainKey, heightKey],
      },
    ],
  })
}
