import {
  AccountIndexerRequestArgs,
  BlockchainId,
  IndexerDomainContext,
  ParserContext,
} from '@aleph-indexer/framework'
import BN from 'bn.js'

export type CommonEvent = {
  blockchain: BlockchainId
  id: string
  timestamp: number
  height: number
  index: number
  transaction: string
  type: string
}

// ------------------------

export type CommonBalance = {
  blockchain: BlockchainId
  account: string
  balance: string // uint256 hex
  balanceNum?: number
  balanceBN?: BN
}

// -------------------------

export type CommonEventQueryArgs = {
  blockchain: BlockchainId
  account?: string
  startDate?: number
  endDate?: number
  startHeight?: number
  endHeight?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

// ------------------------

export type CommonBalanceQueryArgs = {
  blockchain: BlockchainId
  account?: string
  limit?: number
  skip?: number
  reverse?: boolean
}

// ----------------------------

export type BlockchainWorkerI<E = unknown> = {
  onNewAccount(config: AccountIndexerRequestArgs): Promise<void>
  filterEntity(context: ParserContext, entity: E): Promise<boolean>
  indexEntities(context: ParserContext, entities: E[]): Promise<void>
  getBalances(args: CommonBalanceQueryArgs): Promise<CommonBalance[]>
  getEvents(args: CommonEventQueryArgs): Promise<CommonEvent[]>
}

export type BlockchainWorkerClassI<E = unknown> = {
  new (context: IndexerDomainContext, ...args: any[]): BlockchainWorkerI<E>
}
