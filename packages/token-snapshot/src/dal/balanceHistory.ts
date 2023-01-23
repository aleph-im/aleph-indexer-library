import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenHolding } from '../types.js'

export enum BalanceHistoryDALIndex {
  MintAccount = 'mint_account',
}

export type AccountBalanceHistoryStorage = EntityStorage<SPLTokenHolding>

const mintKey = {
  get: (e: SPLTokenHolding) => e.tokenMint,
  length: EntityStorage.AddressLength,
}

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
    key: [mintKey, accountKey, timestampKey],
    indexes: [
      {
        name: BalanceHistoryDALIndex.MintAccount,
        key: [mintKey, accountKey],
      },
    ],
  })
}
