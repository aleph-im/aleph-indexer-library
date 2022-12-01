import BN from 'bn.js'
import { EntityStorage, EntityUpdateOp } from '@aleph-indexer/core'
import { SPLAccountBalance } from '../types.js'

const mappedProps = ['balance']

export enum BalanceStateDALIndex {
  BalanceAccount = 'balance_account',
}

export type BalanceStateStorage = EntityStorage<SPLAccountBalance>

const idKey = {
  get: (e: SPLAccountBalance) => e.account,
  length: EntityStorage.AddressLength,
}

const balanceKey = {
  get: (e: SPLAccountBalance) => e.balance,
  length: EntityStorage.TimestampLength,
}

export function createBalanceStateDAL(path: string): BalanceStateStorage {
  return new EntityStorage<SPLAccountBalance>({
    name: 'balance_state',
    path,
    key: [idKey],
    indexes: [
      {
        name: BalanceStateDALIndex.BalanceAccount,
        key: [balanceKey, idKey],
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
    ): Promise<EntityUpdateOp> {
      if (oldEntity && oldEntity.timestamp > newEntity.timestamp) {
        return EntityUpdateOp.Keep
      }

      console.log('Save new entity balance ', newEntity.balance)
      if ((newEntity.balance as string) === '0') {
        return EntityUpdateOp.Delete
      }

      return EntityUpdateOp.Update
    },
  })
}
