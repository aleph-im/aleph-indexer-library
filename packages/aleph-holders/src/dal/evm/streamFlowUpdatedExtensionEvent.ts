import { EntityStorage } from '@aleph-indexer/core'
import { StreamFlowUpdatedExtensionEvent } from '../../types/evm.js'
import { createBNMapper } from '../../utils/index.js'

export type StreamFlowUpdatedExtensionEventStorage =
  EntityStorage<StreamFlowUpdatedExtensionEvent>

export enum StreamFlowUpdatedExtensionEventDALIndex {
  BlockchainTimestampIndex = 'blockchain_timestamp_index',
  BlockchainHeightIndex = 'blockchain_height_index',
  BlockchainAccountTimestampIndex = 'blockchain_account_timestamp_index',
  BlockchainAccountHeightIndex = 'blockchain_account_height_index',
}

const idKey = {
  get: (e: StreamFlowUpdatedExtensionEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: StreamFlowUpdatedExtensionEvent) => e.flowOperator,
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: StreamFlowUpdatedExtensionEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: StreamFlowUpdatedExtensionEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: StreamFlowUpdatedExtensionEvent) => e.height,
  // @note: up to 10**9 [9 digits] enough for +300 years in ethereum (10s block time)
  length: 9,
}

const indexKey = {
  get: (e: StreamFlowUpdatedExtensionEvent) => e.index,
  length: 4,
}

export function createStreamFlowUpdatedExtensionEventDAL(
  path: string,
): StreamFlowUpdatedExtensionEventStorage {
  return new EntityStorage<StreamFlowUpdatedExtensionEvent>({
    name: 'stream_flow_updated_extension_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: StreamFlowUpdatedExtensionEventDALIndex.BlockchainTimestampIndex,
        key: [blockchainKey, timestampKey, indexKey],
      },
      {
        name: StreamFlowUpdatedExtensionEventDALIndex.BlockchainHeightIndex,
        key: [blockchainKey, heightKey, indexKey],
      },
      {
        name: StreamFlowUpdatedExtensionEventDALIndex.BlockchainAccountTimestampIndex,
        key: [blockchainKey, accountKey, timestampKey, indexKey],
      },
      {
        name: StreamFlowUpdatedExtensionEventDALIndex.BlockchainAccountHeightIndex,
        key: [blockchainKey, accountKey, heightKey, indexKey],
      },
    ],
    mapValueFn: createBNMapper(['deposit']),
  })
}
