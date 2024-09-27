import { PendingWorkStorage } from '@aleph-indexer/core'

export type ProcessUpdatedFlowStorage = PendingWorkStorage<void>

export function createProcessUpdatedFlowDAL(
  path: string,
): PendingWorkStorage<void> {
  return new PendingWorkStorage<void>({
    name: 'process_updated_flow',
    path,
  })
}
