import { BlockchainId } from '@aleph-indexer/framework'
import BN from 'bn.js'

export type AlephEvent = {
  blockchain: BlockchainId
  id: string
  timestamp: number
  height: number
  transaction: string
}

export type ERC20TransferEvent = AlephEvent & {
  from: string
  to: string
  value: string // uint256 hex
  valueNum?: number
  valueBN?: BN
}

export type Balance = {
  blockchain: BlockchainId
  account: string
  balance: string // uint256 hex
  balanceNum?: number
  balanceBN?: BN
}

export enum EventType {
  Transfer = 'Transfer(address,address,uint256)',
}

export type ERC20TransferEventQueryArgs = {
  // @todo: Implement this query filters
  // address?: string
  // types?: string[]
  blockchain: BlockchainId
  startDate?: number
  endDate?: number
  startHeight?: number
  endHeight?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type BalanceQueryArgs = {
  blockchain: BlockchainId
  account?: string
  limit?: number
  skip?: number
  reverse?: boolean
}
