import { EntityStorage, EntityUpdateOp } from '@aleph-indexer/core'
import { SPLTokenHolding } from '../types.js'

export enum BalanceStateDALIndex {
  Mint = 'mint',
  BalanceAccount = 'balance_account',
}

export type AccountBalanceStateStorage = EntityStorage<SPLTokenHolding>

const accountKey = {
  get: (e: SPLTokenHolding) => e.account,
  length: EntityStorage.AddressLength,
}

const mintKey = {
  get: (e: SPLTokenHolding) => e.tokenMint,
  length: EntityStorage.AddressLength,
}

const balanceKey = {
  get: (e: SPLTokenHolding) => e.balances.total,
  length: EntityStorage.TimestampLength,
}

export function createBalanceStateDAL(
  path: string,
): AccountBalanceStateStorage {
  return new EntityStorage<SPLTokenHolding>({
    name: 'account_balance_state',
    path,
    key: [mintKey, accountKey],
    indexes: [
      {
        name: BalanceStateDALIndex.Mint,
        key: [mintKey],
      },
      {
        name: BalanceStateDALIndex.BalanceAccount,
        key: [mintKey, balanceKey],
      },
    ],
    async updateCheckFn(
      oldEntity: SPLTokenHolding | undefined,
      newEntity: SPLTokenHolding,
    ): Promise<EntityUpdateOp> {
      if (oldEntity && oldEntity.timestamp > newEntity.timestamp) {
        return EntityUpdateOp.Keep
      }
      return EntityUpdateOp.Update
    },
    // @todo: maybe calculate total on insert/update?
  })
}
