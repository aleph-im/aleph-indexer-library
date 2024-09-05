import { EntityStorage, EntityUpdateOp } from '@aleph-indexer/core'
import { ERC20Balance as ERC20Balance } from '../types.js'
import {
  bigNumberToUint256,
  blockchainDecimals,
  hexStringToBigNumber,
  hexStringToNumber,
} from '../utils/index.js'

export type ERC20BalanceStorage = EntityStorage<ERC20Balance>

export enum ERC20BalanceDALIndex {
  BlockchainAccount = 'blockchain_account',
  BlockchainBalance = 'blockchain_balance',
}

const accountKey = {
  get: (e: ERC20Balance) => e.account,
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: ERC20Balance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const balanceKey = {
  get: (e: ERC20Balance) => e.balance,
  length: 65, // @note: uint256 => 32 bytes => 64 characters + 1 char sign (-) => 65
}

const mapValueFn = async (value: any) => {
  // @note: Indexes sometimes are not synced with main storage
  if (!value) return value

  try {
    // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
    value.balanceBN = hexStringToBigNumber(value.balance)
    value.balanceNum = hexStringToNumber(
      value.balance,
      blockchainDecimals[value.blockchain],
    )
  } catch (e) {
    console.log(e)
    console.log('ERR VAL', value)
  }

  return value
}

export function createERC20BalanceDAL(path: string): ERC20BalanceStorage {
  return new EntityStorage<ERC20Balance>({
    name: 'erc20_balance',
    path,
    key: [blockchainKey, accountKey],
    indexes: [
      {
        name: ERC20BalanceDALIndex.BlockchainAccount,
        key: [blockchainKey, accountKey],
      },
      {
        name: ERC20BalanceDALIndex.BlockchainBalance,
        key: [blockchainKey, balanceKey],
      },
    ],
    mapValueFn,
    updateCheckFn: async (oldEntity, newEntity) => {
      let entity = newEntity

      if (oldEntity) {
        const oldBalance = hexStringToBigNumber(oldEntity.balance)
        const newBalance = hexStringToBigNumber(newEntity.balance)
        const balance = bigNumberToUint256(oldBalance.add(newBalance))

        entity = {
          ...newEntity,
          balance,
        }
      }

      const balance = hexStringToBigNumber(entity.balance)
      if (balance.isZero()) return { op: EntityUpdateOp.Delete }

      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
