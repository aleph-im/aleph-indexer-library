import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenTrackAccount } from '../../types/solana'

export type SPLTokenTrackAccountStorage = EntityStorage<SPLTokenTrackAccount>

const blockchainKey = {
  get: (e: SPLTokenTrackAccount) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: SPLTokenTrackAccount) => e.account,
  length: EntityStorage.AddressLength,
}

export function createSPLTokenTrackAccountDAL(
  path: string,
): SPLTokenTrackAccountStorage {
  return new EntityStorage<SPLTokenTrackAccount>({
    name: 'spl_token_track_account',
    path,
    key: [blockchainKey, accountKey],
  })
}
