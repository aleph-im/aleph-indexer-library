import { EntityStorage, EntityUpdateOp } from '@aleph-indexer/core'

export type TokenAccountStorage = EntityStorage<TokenAccount>

export type TokenAccount = {
  address: string
  owner: string
}

const accountKey = {
  get: (e: TokenAccount) => e.address,
  length: EntityStorage.AddressLength,
}

export function createTokenAccounttDAL(path: string): TokenAccountStorage {
  return new EntityStorage<TokenAccount>({
    name: 'account_mint',
    path,
    key: [accountKey],
    // there are events with no owner, persists owner if any
    updateCheckFn: async (oldEntity, newEntity) => {
      const entity = newEntity

      if (oldEntity) {
        if (oldEntity.owner) {
          entity.owner = oldEntity.owner
        }
      }

      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
