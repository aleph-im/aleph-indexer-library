import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenEvent } from '../../types/solana.js'
import { createBNMapper } from '../../utils/numbers.js'

export type SPLTokenEventStorage = EntityStorage<SPLTokenEvent>

export enum SPLTokenEventDALIndex {
  BlockchainTimestamp = 'blockchain_timestamp',
  BlockchainHeight = 'blockchain_height',
  BlockchainAccountTimestamp = 'blockchain_account_timestamp',
  BlockchainAccountHeight = 'blockchain_account_height',
}

const idKey = {
  get: (e: SPLTokenEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: SPLTokenEvent) => e.account,
  length: EntityStorage.AddressLength,
}

const blockchainKey = {
  get: (e: SPLTokenEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: SPLTokenEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const slotKey = {
  get: (e: SPLTokenEvent) => e.slot,
  // @note: up to 10**10 [10 digits] enough for +120 years in solana (400ms slot time)
  length: 10,
}

export function createSPLTokenEventDAL(path: string): SPLTokenEventStorage {
  return new EntityStorage<SPLTokenEvent>({
    name: 'spl_token_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: SPLTokenEventDALIndex.BlockchainTimestamp,
        key: [blockchainKey, timestampKey],
      },
      {
        name: SPLTokenEventDALIndex.BlockchainHeight,
        key: [blockchainKey, slotKey],
      },
      {
        name: SPLTokenEventDALIndex.BlockchainAccountTimestamp,
        key: [blockchainKey, accountKey, timestampKey],
      },
      {
        name: SPLTokenEventDALIndex.BlockchainAccountHeight,
        key: [blockchainKey, accountKey, slotKey],
      },
    ],
    mapValueFn: createBNMapper(['balance']),
  })
}
