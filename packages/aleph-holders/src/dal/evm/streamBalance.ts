import { EntityStorage } from '@aleph-indexer/core'
import { StreamBalance } from '../../types/evm.js'
import { createBNMapper } from '../../utils/index.js'

export type StreamBalanceStorage = EntityStorage<StreamBalance>

export enum StreamBalanceDALIndex {
  BlockchainAccount = 'blockchain_account',
  BlockchainBalance = 'blockchain_balance',
}

const idKey = {
  get: (e: StreamBalance) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: StreamBalance) => e.account,
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: StreamBalance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

// @todo: Take into account flowRate to sort by total balance (static + real time)
const staticBalanceKey = {
  get: (e: StreamBalance) => e.staticBalance,
  length: 65, // @note: uint256 => 32 bytes => 64 characters + 1 char sign (-) => 65
}

export function createStreamBalanceDAL(path: string): StreamBalanceStorage {
  return new EntityStorage<StreamBalance>({
    name: 'stream_balance',
    path,
    key: [blockchainKey, accountKey, idKey],
    indexes: [
      {
        name: StreamBalanceDALIndex.BlockchainAccount,
        key: [blockchainKey, accountKey],
      },
      {
        name: StreamBalanceDALIndex.BlockchainBalance,
        key: [blockchainKey, staticBalanceKey],
      },
    ],
    mapValueFn: createBNMapper(['staticBalance', 'flowRate', 'deposit']),
  })
}
