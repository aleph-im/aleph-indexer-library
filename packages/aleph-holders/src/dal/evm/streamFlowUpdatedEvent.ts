import { EntityStorage } from '@aleph-indexer/core'
import { StreamFlowUpdatedEvent } from '../../types/evm.js'
import { createBNMapper } from '../../utils/index.js'

export type StreamFlowUpdatedEventStorage =
  EntityStorage<StreamFlowUpdatedEvent>

export enum StreamFlowUpdatedEventDALIndex {
  BlockchainTimestampIndex = 'blockchain_timestamp_index',
  BlockchainHeightIndex = 'blockchain_height_index',
  BlockchainAccountTimestampIndex = 'blockchain_account_timestamp_index',
  BlockchainAccountHeightIndex = 'blockchain_account_height_index',
}

const idKey = {
  get: (e: StreamFlowUpdatedEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: StreamFlowUpdatedEvent) => [e.from, e.to],
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: StreamFlowUpdatedEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: StreamFlowUpdatedEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: StreamFlowUpdatedEvent) => e.height,
  // @note: up to 10**9 [9 digits] enough for +300 years in ethereum (10s block time)
  length: 9,
}

const indexKey = {
  get: (e: StreamFlowUpdatedEvent) => e.index,
  length: 4,
}

export function createStreamFlowUpdatedEventDAL(
  path: string,
): StreamFlowUpdatedEventStorage {
  return new EntityStorage<StreamFlowUpdatedEvent>({
    name: 'stream_flow_updated_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainTimestampIndex,
        key: [blockchainKey, timestampKey, indexKey],
      },
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainHeightIndex,
        key: [blockchainKey, heightKey, indexKey],
      },
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainAccountTimestampIndex,
        key: [blockchainKey, accountKey, timestampKey, indexKey],
      },
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainAccountHeightIndex,
        key: [blockchainKey, accountKey, heightKey, indexKey],
      },
    ],
    mapValueFn: createBNMapper(['flowRate']),
  })
}
