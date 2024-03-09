import { EntityStorage } from '@aleph-indexer/core'

export type TokenAccountStorage = EntityStorage<TokenAccount>

export type TokenAccount = {
  address: string
  owner: string
  mint: string
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
  })
}
