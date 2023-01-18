import BN from 'bn.js'
import { EntityStorage, EntityUpdateOp } from '@aleph-indexer/core'
import { SPLTokenHolding } from '../types.js'

const mappedProps = ['balance']

export enum BalanceStateDALIndex {
  Mint = 'mint',
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
      oldEntity: SPLTokenHolding | undefined,
      newEntity: SPLTokenHolding,
    ): Promise<EntityUpdateOp> {
      if (oldEntity && oldEntity.timestamp > newEntity.timestamp) {
        return EntityUpdateOp.Keep
      }
      return EntityUpdateOp.Update
    },
  })
}
