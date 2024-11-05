import { EntityStorage } from '@aleph-indexer/core'
import { MPLTokenEvent } from '../../types/solana.js'
import { getAllIndexableAccountsFromEvent } from '../../utils/solana.js'

export type MPLTokenEventStorage = EntityStorage<MPLTokenEvent>

export enum MPLTokenEventDALIndex {
  BlockchainTimestampIndex = 'blockchain_timestamp_index',
  BlockchainHeightIndex = 'blockchain_height_index',
  BlockchainAccountTimestampIndex = 'blockchain_account_timestamp_index',
  BlockchainAccountHeightIndex = 'blockchain_account_height_index',
}

const idKey = {
  get: (e: MPLTokenEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: MPLTokenEvent) => getAllIndexableAccountsFromEvent(e),
  length: EntityStorage.AddressLength,
}

const blockchainKey = {
  get: (e: MPLTokenEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: MPLTokenEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: MPLTokenEvent) => e.height,
  // @note: up to 10**10 [10 digits] enough for +120 years in solana (400ms slot time)
  length: 10,
}

const indexKey = {
  get: (e: MPLTokenEvent) => e.index,
  length: 4,
}

export function createMPLTokenEventDAL(path: string): MPLTokenEventStorage {
  return new EntityStorage<MPLTokenEvent>({
    name: 'mpl_token_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: MPLTokenEventDALIndex.BlockchainTimestampIndex,
        key: [blockchainKey, timestampKey, indexKey],
      },
      {
        name: MPLTokenEventDALIndex.BlockchainHeightIndex,
        key: [blockchainKey, heightKey, indexKey],
      },
      {
        name: MPLTokenEventDALIndex.BlockchainAccountTimestampIndex,
        key: [blockchainKey, accountKey, timestampKey, indexKey],
      },
      {
        name: MPLTokenEventDALIndex.BlockchainAccountHeightIndex,
        key: [blockchainKey, accountKey, heightKey, indexKey],
      },
    ],
  })
}
