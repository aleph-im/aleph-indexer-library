import { EntityStorage, EntityUpdateOp } from '@aleph-indexer/core'
import { Balance } from '../types.js'
import {
  bigNumberToString,
  blockchainDecimals,
  uint256ToBigNumber,
  uint256ToNumber,
} from '../utils/index.js'

export type BalanceStorage = EntityStorage<Balance>

export enum BalanceDALIndex {
  BlockchainAccount = 'blockchain_account',
  BlockchainBalance = 'blockchain_balance',
}

const accountKey = {
  get: (e: Balance) => e.account,
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: Balance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const balanceKey = {
  get: (e: Balance) => e.balance,
  length: 65, // @note: uint256 => 32 bytes => 64 characters + 1 char sign (-) => 65
}

const mapValueFn = async (value: any) => {
  // @note: Indexes sometimes are not synced with main storage
  if (!value) return value

  try {
    // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
    value.balanceBN = uint256ToBigNumber(value.balance)
    value.balanceNum = uint256ToNumber(
      value.balance,
      blockchainDecimals[value.blockchain],
    )
  } catch (e) {
    console.log(e)
    console.log('ERR VAL', value)
  }

  return value
}

export function createBalanceDAL(path: string): BalanceStorage {
  return new EntityStorage<Balance>({
    name: 'erc20_balance',
    path,
    key: [blockchainKey, accountKey],
    indexes: [
      {
        name: BalanceDALIndex.BlockchainAccount,
        key: [blockchainKey, accountKey],
      },
      {
        name: BalanceDALIndex.BlockchainBalance,
        key: [blockchainKey, balanceKey],
      },
    ],
    mapValueFn,
    updateCheckFn: async (oldEntity, newEntity) => {
      let entity = newEntity

      if (oldEntity) {
        const oldBalance = uint256ToBigNumber(oldEntity.balance)
        const newBalance = uint256ToBigNumber(newEntity.balance)
        const result = oldBalance.add(newBalance)

        if (result.isZero()) {
          return { op: EntityUpdateOp.Delete }
        }

        entity = {
          ...newEntity,
          balance: bigNumberToString(result),
        }
      }

      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
