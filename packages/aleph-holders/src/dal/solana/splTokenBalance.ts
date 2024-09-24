import {
  EntityStorage,
  EntityUpdateCheckFnReturn,
  EntityUpdateOp,
} from '@aleph-indexer/core'
import { SPLTokenBalance } from '../../types/solana.js'
import { createBNMapper, hexStringToBigNumber } from '../../utils/numbers.js'

export enum SPLTokenBalanceDALIndex {
  BlockchainAccount = 'blockchain_account',
  BlockchainBalance = 'blockchain_balance',
}

export type SPLTokenBalanceStorage = EntityStorage<SPLTokenBalance>

const accountKey = {
  get: (e: SPLTokenBalance) => e.account,
  length: EntityStorage.AddressLength,
}

const mintKey = {
  get: (e: SPLTokenBalance) => e.mint,
  length: EntityStorage.AddressLength,
}

const balanceKey = {
  get: (e: SPLTokenBalance) => e.balance,
  length: EntityStorage.TimestampLength,
}

const blockchainKey = {
  get: (e: SPLTokenBalance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

export function createSPLTokenBalanceDAL(path: string): SPLTokenBalanceStorage {
  return new EntityStorage<SPLTokenBalance>({
    name: 'spl_token_balance',
    path,
    key: [mintKey, accountKey],
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

      if (oldEntity && oldEntity.height > newEntity.height) {
        return { op: EntityUpdateOp.Keep }
      }

      // @note: We can not delete it, because if an older ix arrives we cant compare dates and the balance will be outdated
      // const balance = hexStringToBigNumber(entity.balance)
      // if (balance.isZero()) return { op: EntityUpdateOp.Delete }

      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
