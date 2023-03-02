import { EntityStorage } from '@aleph-indexer/core'
import { OwnerMint } from '../domain/types.js'

export type OwnerMintStorage = EntityStorage<OwnerMint>

const mintKey = {
  get: (e: OwnerMint) => e.mint,
  length: EntityStorage.AddressLength,
}

const ownerKey = {
  get: (e: OwnerMint) => e.owner,
  length: EntityStorage.AddressLength,
}

export function createOwnerMintDAL(path: string): OwnerMintStorage {
  return new EntityStorage<OwnerMint>({
    name: 'owner_mint',
    path,
    key: [mintKey, ownerKey],
  })
}
