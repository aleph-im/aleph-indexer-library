import {
  EntityStorage,
  EntityUpdateCheckFnReturn,
  EntityUpdateOp,
} from '@aleph-indexer/core'
import { SPLTokenBalance } from '../../types/solana.js'
import {
  bigNumberToUint256,
  createBNMapper,
  hexStringToBigNumber,
} from '../../utils/numbers.js'
import BN from 'bn.js'

export enum SPLTokenBalanceDALIndex {
  BlockchainAccount = 'blockchain_account',
  BlockchainBalance = 'blockchain_balance',
}

export type SPLTokenBalanceStorage = EntityStorage<SPLTokenBalance>

const accountKey = {
  get: (e: SPLTokenBalance) => e.account,
  length: EntityStorage.AddressLength,
}

const balanceKey = {
  get: (e: SPLTokenBalance) => e.balance,
  length: 65, // @note: uint256 => 32 bytes => 64 characters + 1 char sign (-) => 65
}

const blockchainKey = {
  get: (e: SPLTokenBalance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

export function createSPLTokenBalanceDAL(path: string): SPLTokenBalanceStorage {
  return new EntityStorage<SPLTokenBalance>({
    name: 'spl_token_balance',
    path,
    key: [blockchainKey, accountKey],
    indexes: [
      {
        name: SPLTokenBalanceDALIndex.BlockchainAccount,
        key: [blockchainKey, accountKey],
      },
      {
        name: SPLTokenBalanceDALIndex.BlockchainBalance,
        key: [blockchainKey, balanceKey],
      },
    ],
    mapValueFn: createBNMapper(['balance']),
    async updateCheckFn(
      oldEntity: SPLTokenBalance | undefined,
      newEntity: SPLTokenBalance,
    ): Promise<EntityUpdateCheckFnReturn<SPLTokenBalance>> {
      const entity = newEntity

      if (oldEntity) {
        // @note: Owner account aggregating all sub token accounts
        if (oldEntity.ownerAccounts && newEntity.ownerAccounts) {
          const ownerAccounts = { ...oldEntity.ownerAccounts }

          const accounts = [
            ...new Set([
              ...Object.keys(oldEntity.ownerAccounts),
              ...Object.keys(newEntity.ownerAccounts),
            ]),
          ]

          let isUpdate = false

          for (const account of accounts) {
            const oldAccount = oldEntity.ownerAccounts[account]
            const newAccount = newEntity.ownerAccounts[account]

            if ((newAccount.height || 0) > (oldAccount.height || 0)) {
              ownerAccounts[account] = newAccount
              isUpdate = true
            }
          }

          if (!isUpdate) return { op: EntityUpdateOp.Keep }

          const balance = bigNumberToUint256(
            Object.values(ownerAccounts).reduce((ac, cv) => {
              const accountBalance = hexStringToBigNumber(cv.balance)
              return accountBalance.add(ac)
            }, new BN(0)),
          )

          const timestamp = Object.values(ownerAccounts).reduce((ac, cv) => {
            return Math.max(ac, cv.timestamp)
          }, 0)

          const entity: Required<SPLTokenBalance> = {
            ...oldEntity,
            ownerAccounts,
            balance,
            timestamp,
          }

          return { op: EntityUpdateOp.Update, entity }
        }

        // @note: Regular token account update
        if (oldEntity.height >= newEntity.height) {
          return { op: EntityUpdateOp.Keep }
        }
      }

      // @note: We can not delete it, because if an older ix arrives we cant compare dates and the balance will be outdated
      // const balance = hexStringToBigNumber(entity.balance)
      // if (balance.isZero()) return { op: EntityUpdateOp.Delete }

      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
