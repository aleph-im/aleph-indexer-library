import { PendingWorkStorage } from '@aleph-indexer/core'
import { ERC20TransferEvent } from '../../types/evm'

export type ERC20PendingTransferEventStorage =
  PendingWorkStorage<ERC20TransferEvent>

export function createERC20PendingTransferEventDAL(
  path: string,
): PendingWorkStorage<ERC20TransferEvent> {
  return new PendingWorkStorage<ERC20TransferEvent>({
    name: 'pending_transfer_events',
    path,
  })
}
