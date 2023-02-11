import { EntityStorage } from '@aleph-indexer/core'
import { SyncEvent } from '../types.js'

export type SyncEventStorage = EntityStorage<SyncEvent>

export enum SyncEventDALIndex {
  BlockchainTimestamp = 'blockchain_timestamp',
  BlockchainHeight = 'blockchain_height',
}

const idKey = {
  get: (e: SyncEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const blockchainKey = {
  get: (e: SyncEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: SyncEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: SyncEvent) => e.height,
  // @note: up to 10**9 [9 digits] enough for 300 years in ethereum
  length: 8,
}

export function createSyncEventDAL(path: string): SyncEventStorage {
  return new EntityStorage<SyncEvent>({
    name: 'sync_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: SyncEventDALIndex.BlockchainTimestamp,
        key: [blockchainKey, timestampKey],
      },
      {
        name: SyncEventDALIndex.BlockchainHeight,
        key: [blockchainKey, heightKey],
      },
    ],
  })
}
