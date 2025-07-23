import { EntityStorage } from '@aleph-indexer/core'
import { ERC20TransferEvent } from '../../types/evm.js'
import { createBNMapper } from '../../utils/index.js'

export type ERC20TransferEventStorage = EntityStorage<ERC20TransferEvent>

export enum ERC20TransferEventDALIndex {
  BlockchainTokenTimestampIndex = 'blockchain_token_timestamp_index',
  BlockchainTokenUpdatedIndex = 'blockchain_token_updated_index',
  BlockchainTokenHeightIndex = 'blockchain_token_height_index',
  BlockchainTokenAccountTimestampIndex = 'blockchain_token_account_timestamp_index',
  BlockchainTokenAccountUpdatedIndex = 'blockchain_token_account_updated_index',
  BlockchainTokenAccountHeightIndex = 'blockchain_token_account_height_index',
  BlockchainTokenTransaction = 'blockchain_token_transaction',
}

const idKey = {
  get: (e: ERC20TransferEvent): string => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: ERC20TransferEvent): string[] => [e.from, e.to],
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: ERC20TransferEvent): string => e.blockchain,
  length: EntityStorage.VariableLength,
}

const tokenKey = {
  get: (e: ERC20TransferEvent): string => e.token,
  length: EntityStorage.VariableLength,
}

const transactionKey = {
  get: (e: ERC20TransferEvent): string => e.transaction,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: ERC20TransferEvent): number => e.timestamp,
  length: EntityStorage.TimestampLength,
}

const updatedKey = {
  get: (e: ERC20TransferEvent): number => e.updated,
  length: EntityStorage.TimestampLength,
}

const heightKey = {
  get: (e: ERC20TransferEvent): number => e.height,
  // @note: up to 10**9 [9 digits] enough for +300 years in ethereum (10s block time)
  length: 9,
}

const indexKey = {
  get: (e: ERC20TransferEvent): number => e.index,
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
        name: ERC20TransferEventDALIndex.BlockchainTokenTimestampIndex,
        key: [blockchainKey, tokenKey, timestampKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainTokenUpdatedIndex,
        key: [blockchainKey, tokenKey, updatedKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainTokenHeightIndex,
        key: [blockchainKey, tokenKey, heightKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainTokenAccountTimestampIndex,
        key: [blockchainKey, tokenKey, accountKey, timestampKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainTokenAccountUpdatedIndex,
        key: [blockchainKey, tokenKey, accountKey, updatedKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainTokenAccountHeightIndex,
        key: [blockchainKey, tokenKey, accountKey, heightKey, indexKey],
      },
      {
        name: ERC20TransferEventDALIndex.BlockchainTokenTransaction,
        key: [blockchainKey, tokenKey, transactionKey],
      },
    ],
    mapValueFn: createBNMapper(['value']),
  })
}
