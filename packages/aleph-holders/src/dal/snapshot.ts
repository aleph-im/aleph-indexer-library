import { EntityStorage } from '@aleph-indexer/core'
import { Snapshot } from '../types.js'

export type SnapshotStorage = EntityStorage<Snapshot>

const timestampKey = {
  get: (e: Snapshot) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

export function createSnapshotDAL(path: string): SnapshotStorage {
  return new EntityStorage<Snapshot>({
    name: 'snapshot',
    path,
    key: [timestampKey],
  })
}
