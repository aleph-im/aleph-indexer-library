import { EntityStorage } from '@aleph-indexer/core'
import { StreamFlowUpdatedEvent } from '../../types/evm.js'
import { createBNMapper } from '../../utils/index.js'

export type StreamFlowUpdatedEventStorage =
  EntityStorage<StreamFlowUpdatedEvent>

export enum StreamFlowUpdatedEventDALIndex {
  BlockchainTimestamp = 'blockchain_timestamp',
  BlockchainHeight = 'blockchain_height',
  BlockchainAccountTimestamp = 'blockchain_account_timestamp',
  BlockchainAccountHeight = 'blockchain_account_height',
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

export function createStreamFlowUpdatedEventDAL(
  path: string,
): StreamFlowUpdatedEventStorage {
  return new EntityStorage<StreamFlowUpdatedEvent>({
    name: 'stream_flow_updated_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainTimestamp,
        key: [blockchainKey, timestampKey],
      },
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainHeight,
        key: [blockchainKey, heightKey],
      },
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainAccountTimestamp,
        key: [blockchainKey, accountKey, timestampKey],
      },
      {
        name: StreamFlowUpdatedEventDALIndex.BlockchainAccountHeight,
        key: [blockchainKey, accountKey, heightKey],
      },
    ],
    mapValueFn: createBNMapper(['flowRate']),
  })
}
