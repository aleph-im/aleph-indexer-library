import { EntityStorage } from '@aleph-indexer/core'
import { TransferEvent } from '../types.js'
import {
  blockchainDecimals,
  uint256ToBigNumber,
  uint256ToNumber,
} from '../utils/index.js'

export type TransferEventStorage = EntityStorage<TransferEvent>

export enum TransferEventDALIndex {
  BlockchainTimestamp = 'blockchain_timestamp',
  BlockchainHeight = 'blockchain_height',
  BlockchainAccountTimestamp = 'blockchain_account_timestamp',
  BlockchainAccountHeight = 'blockchain_account_height',
}

const idKey = {
  get: (e: TransferEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: TransferEvent) => [e.from, e.to],
  length: EntityStorage.AddressLength,
}

const blockchainKey = {
  get: (e: TransferEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: TransferEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: TransferEvent) => e.height,
  // @note: up to 10**9 [9 digits] enough for 300 years in ethereum
  // on solana 14 years aprox, block gen each 400ms
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

export function createTransferEventDAL(
  path: string,
): TransferEventStorage {
  return new EntityStorage<TransferEvent>({
    name: 'transfer_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: TransferEventDALIndex.BlockchainTimestamp,
        key: [blockchainKey, timestampKey],
      },
      {
        name: TransferEventDALIndex.BlockchainHeight,
        key: [blockchainKey, heightKey],
      },
      {
        name: TransferEventDALIndex.BlockchainAccountTimestamp,
        key: [blockchainKey, accountKey, timestampKey],
      },
      {
        name: TransferEventDALIndex.BlockchainAccountHeight,
        key: [blockchainKey, accountKey, heightKey],
      },
    ],
    mapValueFn,
  })
}
