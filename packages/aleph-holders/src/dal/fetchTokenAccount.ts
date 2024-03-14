import { EntityUpdateOp, PendingWorkStorage } from '@aleph-indexer/core'
import { SPLTokenEvent } from '../types'

export type IndexTokenAccount = {
  account: string
  timestamp: number
  event: SPLTokenEvent
}

export type FetchTokenAccountStorage = PendingWorkStorage<IndexTokenAccount>

export function createFetchTokenAccountDAL(
  path: string,
  name = 'fetcher_token_accounts',
): FetchTokenAccountStorage {
  return new PendingWorkStorage<IndexTokenAccount>({
    name,
    path,
    count: true,
    updateCheckFn: async (oldEntity, newEntity) => {
      const entity = newEntity

      if (oldEntity) {
        if (oldEntity.payload.timestamp > newEntity.payload.timestamp) {
          newEntity.payload = oldEntity.payload
        }
      }

      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
