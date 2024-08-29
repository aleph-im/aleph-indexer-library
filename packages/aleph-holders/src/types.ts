import { BlockchainId } from '@aleph-indexer/framework'
import BN from 'bn.js'

export type CommonEvent = {
  blockchain: BlockchainId
  id: string
  timestamp: number
  height: number
  transaction: string
}

/**
 * Transfer (
 * index_topic_1 address from,
 * index_topic_2 address to,
 * uint256 value)
 */
export type ERC20TransferEvent = CommonEvent & {
  from: string
  to: string
  value: string // uint256 hex
  valueNum?: number
  valueBN?: BN
}

/**
 * FlowUpdated (
 * index_topic_1 address token,
 * index_topic_2 address sender,
 * index_topic_3 address receiver,
 * int96 flowRate,
 * int256 totalSenderFlowRate,
 * int256 totalReceiverFlowRate,
 * bytes userData)
 */
export type StreamFlowUpdatedEvent = CommonEvent & {
  // token: string
  from: string
  to: string
  flowRate: string // uint256 hex
  flowRateNum?: number
  flowRateBN?: BN
  // totalSenderFlowRate: string // uint256 hex
  // totalReceiverFlowRate: string // uint256 hex
  // userData: string
}

/**
 * FlowUpdatedExtension (
 * index_topic_1 address flowOperator,
 * uint256 deposit)
 */
export type StreamFlowUpdatedExtensionEvent = CommonEvent & {
  flowOperator: string
  deposit: string // uint256 hex
}

// ------------------------

export type CommonBalance = {
  blockchain: BlockchainId
  account: string
}

export type ERC20Balance = CommonBalance & {
  balance: string // uint256 hex
  balanceNum?: number
  balanceBN?: BN
}

export type StreamBalance = CommonBalance & {
  id: string
  timestamp: number
  staticBalance: string // uint256 hex
  staticBalanceNum?: number
  staticBalanceBN?: BN
  flowRate: string // uint256 hex
  flowRateNum?: number
  flowRateBN?: BN
  realTimeBalance?: string // uint256 hex
  realTimeBalanceNum?: number
  realTimeBalanceBN?: BN
  balance?: string // uint256 hex
  balanceNum?: number
  balanceBN?: BN
  updates: number
}

export type Balance = CommonBalance & {
  balance: string // uint256 hex
  balanceNum?: number
  balanceBN?: BN
}

export enum EventType {
  Transfer = 'Transfer(address,address,uint256)',
  FlowUpdated = 'FlowUpdated(address,address,address,int96,int256,int256,bytes)',
  FlowUpdatedExtension = 'FlowUpdatedExtension(address,uint256)',
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

export type ERC20TransferEventQueryArgs = CommonEventQueryArgs

export type StreamFlowUpdatedEventQueryArgs = CommonEventQueryArgs

// ------------------------

export type CommonBalanceQueryArgs = {
  blockchain: BlockchainId
  account?: string
  limit?: number
  skip?: number
  reverse?: boolean
}

export type ERC20BalanceQueryArgs = CommonBalanceQueryArgs

export type StreamBalanceQueryArgs = CommonBalanceQueryArgs
