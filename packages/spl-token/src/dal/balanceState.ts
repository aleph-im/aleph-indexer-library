import BN from 'bn.js'
import {
  EntityStorage,
  EntityUpdateCheckFnReturn,
  EntityUpdateOp,
} from '@aleph-indexer/core'
import { SPLAccountBalance } from '../types.js'

const mappedProps = ['balance']

export enum BalanceStateDALIndex {
  BalanceAccount = 'balance_account',
}

export type AccountBalanceStateStorage = EntityStorage<SPLAccountBalance>

const accountKey = {
  get: (e: SPLAccountBalance) => e.account,
  length: EntityStorage.AddressLength,
}

const mintKey = {
  get: (e: SPLAccountBalance) => e.mint,
  length: EntityStorage.AddressLength,
}

const balanceKey = {
  get: (e: SPLAccountBalance) => e.balance,
  length: EntityStorage.TimestampLength,
}

export function createBalanceStateDAL(
  path: string,
): AccountBalanceStateStorage {
  return new EntityStorage<SPLAccountBalance>({
    name: 'account_balance_state',
    path,
    key: [mintKey, accountKey],
    indexes: [
      {
        name: BalanceStateDALIndex.BalanceAccount,
        key: [mintKey, balanceKey],
      },
    ],
    mapFn: async function (entry: { key: any; value: any }) {
      const { key, value } = entry

      // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
      for (const prop of mappedProps) {
        if (!(prop in value)) continue
        if ((value as any)[prop] instanceof BN) continue
        ;(value as any)[prop] = new BN((value as any)[prop], 'hex')
      }

      return { key, value }
    },
    async updateCheckFn(
      oldEntity: SPLAccountBalance | undefined,
      newEntity: SPLAccountBalance,
    ): Promise<EntityUpdateCheckFnReturn<SPLAccountBalance>> {
      if (oldEntity && oldEntity.timestamp > newEntity.timestamp) {
        return { op: EntityUpdateOp.Keep }
      }

      console.log('Save new entity balance ', newEntity.balance)
      if ((newEntity.balance as string) === '0') {
        return { op: EntityUpdateOp.Delete }
      }

      return { op: EntityUpdateOp.Update, entity: newEntity }
    },
  })
}
