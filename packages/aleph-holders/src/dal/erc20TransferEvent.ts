import { EntityStorage } from '@aleph-indexer/core'
import { ERC20TransferEvent } from '../types.js'
import {
  blockchainDecimals,
  hexStringToBigNumber,
  hexStringToNumber,
} from '../utils/index.js'

export type ERC20TransferEventStorage = EntityStorage<ERC20TransferEvent>

export enum ERC20TransferEventDALIndex {
  BlockchainTimestamp = 'blockchain_timestamp',
  BlockchainHeight = 'blockchain_height',
  BlockchainAccountTimestamp = 'blockchain_account_timestamp',
  BlockchainAccountHeight = 'blockchain_account_height',
}

const idKey = {
  get: (e: ERC20TransferEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: ERC20TransferEvent) => [e.from, e.to],
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: ERC20TransferEvent) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: ERC20TransferEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: ERC20TransferEvent) => e.height,
  // @note: up to 10**9 [9 digits] enough for 300 years in ethereum
  length: 8,
}

const mapValueFn = async (value: any) => {
  // @note: Indexes sometimes are not synced with main storage
  if (!value) return value

  try {
    // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
    value.valueBN = hexStringToBigNumber(value.value)
    value.valueNum = hexStringToNumber(
      value.value,
      blockchainDecimals[value.blockchain],
    )
  } catch (e) {
    console.log(e)
    console.log('ERR VAL', value)
  }

  return value
}

export function createERC20TransferEventDAL(
  path: string,
): ERC20TransferEventStorage {
  return new EntityStorage<ERC20TransferEvent>({
    name: 'erc20_transfer_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: ERC20TransferEventDALIndex.BlockchainTimestamp,
        key: [blockchainKey, timestampKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainHeight,
        key: [blockchainKey, heightKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainAccountTimestamp,
        key: [blockchainKey, accountKey, timestampKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainAccountHeight,
        key: [blockchainKey, accountKey, heightKey],
      },
    ],
    mapValueFn,
  })
}
