import { EntityStorage } from '@aleph-indexer/core'
import { ERC20TransferEvent } from '../../types/evm.js'
import { createBNMapper } from '../../utils/index.js'

export type ERC20TransferEventStorage = EntityStorage<ERC20TransferEvent>

export enum ERC20TransferEventDALIndex {
  BlockchainTimestampIndex = 'blockchain_timestamp_index',
  BlockchainHeightIndex = 'blockchain_height_index',
  BlockchainAccountTimestampIndex = 'blockchain_account_timestamp_index',
  BlockchainAccountHeightIndex = 'blockchain_account_height_index',
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
  // @note: up to 10**9 [9 digits] enough for +300 years in ethereum (10s block time)
  length: 9,
}

const indexKey = {
  get: (e: ERC20TransferEvent) => e.index,
  length: 4,
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
        name: ERC20TransferEventDALIndex.BlockchainTimestampIndex,
        key: [blockchainKey, timestampKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainHeightIndex,
        key: [blockchainKey, heightKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainAccountTimestampIndex,
        key: [blockchainKey, accountKey, timestampKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainAccountHeightIndex,
        key: [blockchainKey, accountKey, heightKey, indexKey],
      },
    ],
    mapValueFn: createBNMapper(['value']),
  })
}
