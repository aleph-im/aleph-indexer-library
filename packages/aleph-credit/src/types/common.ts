import {
  AccountIndexerRequestArgs,
  IndexerDomainContext,
  ParserContext,
} from '@aleph-indexer/framework'
import { BlockchainId, TokenId } from '../utils/constants'
import BN from 'bn.js'

export type CommonEvent = {
  blockchain: BlockchainId
  token: string
  id: string
  timestamp: number
  updated: number
  height: number
  index: number
  transaction: string
  type: string
}

export type CommonTransfer = CommonEvent & {
  from: string
  to: string
  value: string // uint256 hex
  valueNum?: number
  valueBN?: BN
}

// -------------------------

export type CommonQueryArgs = {
  blockchain: BlockchainId
  token: TokenId | string
  limit?: number
  skip?: number
  reverse?: boolean
}

export type CommonEventsQueryArgs = CommonQueryArgs & {
  account?: string
  startDate?: number
  endDate?: number
  startUpdate?: number
  endUpdate?: number
  startHeight?: number
  endHeight?: number
}

export type CommonEventQueryArgs = {
  blockchain: BlockchainId
  token: TokenId | string
  transaction: string
}

export type CommonTransfersQueryArgs = CommonEventsQueryArgs

export type CommonTransferQueryArgs = CommonEventQueryArgs

// ----------------------------

export type BlockchainWorkerI<E = unknown> = {
  onNewAccount(config: AccountIndexerRequestArgs): Promise<void>
  filterEntity(context: ParserContext, entity: E): Promise<boolean>
  indexEntities(context: ParserContext, entities: E[]): Promise<void>
  getTransfers(args: CommonTransfersQueryArgs): Promise<CommonTransfer[]>
  getTransfer(
    args: CommonTransferQueryArgs,
  ): Promise<CommonTransfer | undefined>
  getPendingTransfers(args: CommonQueryArgs): Promise<CommonTransfer[]>
}

export type BlockchainWorkerClassI<E = unknown> = {
  new (context: IndexerDomainContext, ...args: any[]): BlockchainWorkerI<E>
}
