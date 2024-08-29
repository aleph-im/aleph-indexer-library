import { EntityStorage } from '@aleph-indexer/core'
import { StreamFlowUpdatedExtensionEvent } from '../types.js'
import {
  blockchainDecimals,
  uint256ToBigNumber,
  uint256ToNumber,
} from '../utils/index.js'

export type StreamFlowUpdatedExtensionEventStorage =
  EntityStorage<StreamFlowUpdatedExtensionEvent>

export enum SuperfluidFlowUpdatedExtensionEventDALIndex {
  BlockchainTimestamp = 'blockchain_timestamp',
  BlockchainHeight = 'blockchain_height',
  BlockchainAccountTimestamp = 'blockchain_account_timestamp',
  BlockchainAccountHeight = 'blockchain_account_height',
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
  // @note: up to 10**9 [9 digits] enough for 300 years in ethereum
  length: 8,
}

const mapValueFn = async (value: any) => {
  // @note: Indexes sometimes are not synced with main storage
  if (!value) return value

  try {
    // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
    value.valueBN = uint256ToBigNumber(value.value)
    value.valueNum = uint256ToNumber(
      value.value,
      blockchainDecimals[value.blockchain],
    )
  } catch (e) {
    console.log(e)
    console.log('ERR VAL', value)
  }

  return value
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
        name: SuperfluidFlowUpdatedExtensionEventDALIndex.BlockchainTimestamp,
        key: [blockchainKey, timestampKey],
      },
      {
        name: SuperfluidFlowUpdatedExtensionEventDALIndex.BlockchainHeight,
        key: [blockchainKey, heightKey],
      },
      {
        name: SuperfluidFlowUpdatedExtensionEventDALIndex.BlockchainAccountTimestamp,
        key: [blockchainKey, accountKey, timestampKey],
      },
      {
        name: SuperfluidFlowUpdatedExtensionEventDALIndex.BlockchainAccountHeight,
        key: [blockchainKey, accountKey, heightKey],
      },
    ],
    // mapValueFn,
  })
}
