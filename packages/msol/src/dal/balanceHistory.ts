import BN from 'bn.js'
import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenHolding } from '../types.js'

const mappedProps = ['balance']

export type AccountBalanceHistoryStorage = EntityStorage<SPLTokenHolding>

const accountKey = {
  get: (e: SPLTokenHolding) => e.account,
  length: EntityStorage.AddressLength,
}

const timestampKey = {
  get: (e: SPLTokenHolding) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

export function createBalanceHistoryDAL(
  path: string,
): AccountBalanceHistoryStorage {
  return new EntityStorage<SPLTokenHolding>({
    name: 'account_balance_history',
    path,
    key: [accountKey, timestampKey],
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
  })
}
