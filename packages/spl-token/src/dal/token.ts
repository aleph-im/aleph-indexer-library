import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenInfo } from '../types.js'

export type EventStorage = EntityStorage<SPLTokenInfo>

const addressKey = {
  get: (e: SPLTokenInfo) => e.address,
  length: EntityStorage.VariableLength,
}

export function createTokenDAL(path: string): EventStorage {
  return new EntityStorage<SPLTokenInfo>({
    name: 'token',
    path,
    key: [addressKey],
  })
}
