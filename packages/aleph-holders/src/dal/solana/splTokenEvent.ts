import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenEvent } from '../../types/solana.js'
import { createBNMapper } from '../../utils/numbers.js'
import { getAllIndexableAccountsFromEvent } from '../../utils/solana.js'

export type SPLTokenEventStorage = EntityStorage<SPLTokenEvent>

export enum SPLTokenEventDALIndex {
  BlockchainTimestampIndex = 'blockchain_timestamp_index',
  BlockchainHeightIndex = 'blockchain_height_index',
  BlockchainAccountTimestampIndex = 'blockchain_account_timestamp_index',
  BlockchainAccountHeightIndex = 'blockchain_account_height_index',
}

const idKey = {
  get: (e: SPLTokenEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: SPLTokenEvent) => getAllIndexableAccountsFromEvent(e),
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

const heightKey = {
  get: (e: SPLTokenEvent) => e.height,
  // @note: up to 10**10 [10 digits] enough for +120 years in solana (400ms slot time)
  length: 10,
}

const indexKey = {
  get: (e: SPLTokenEvent) => e.index,
  length: 4,
}

export function createSPLTokenEventDAL(path: string): SPLTokenEventStorage {
  return new EntityStorage<SPLTokenEvent>({
    name: 'spl_token_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: SPLTokenEventDALIndex.BlockchainTimestampIndex,
        key: [blockchainKey, timestampKey, indexKey],
      },
      {
        name: SPLTokenEventDALIndex.BlockchainHeightIndex,
        key: [blockchainKey, heightKey, indexKey],
      },
      {
        name: SPLTokenEventDALIndex.BlockchainAccountTimestampIndex,
        key: [blockchainKey, accountKey, timestampKey, indexKey],
      },
      {
        name: SPLTokenEventDALIndex.BlockchainAccountHeightIndex,
        key: [blockchainKey, accountKey, heightKey, indexKey],
      },
    ],
    mapValueFn: createBNMapper([
      'amount',
      'balance',
      'toBalance',
      'delegateBalance',
    ]),
  })
}
