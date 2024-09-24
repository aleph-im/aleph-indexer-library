import BN from 'bn.js'
import { CommonBalance, CommonEvent } from './common'

export enum EVMEventType {
  Transfer = 'transfer',
  FlowUpdated = 'flowUpdated',
  FlowUpdatedExtension = 'flowUpdatedExtension',
}

/**
 * Transfer (
 * index_topic_1 address from,
 * index_topic_2 address to,
 * uint256 value)
 */
export type ERC20TransferEvent = CommonEvent & {
  type: EVMEventType.Transfer
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
  type: EVMEventType.FlowUpdated
  // token: string
  from: string
  to: string
  flowRate: string // int96 hex
  flowRateNum?: number
  flowRateBN?: BN
  // totalSenderFlowRate: string // int256 hex
  // totalReceiverFlowRate: string // int256 hex
  // userData: string
}

/**
 * FlowUpdatedExtension (
 * index_topic_1 address flowOperator,
 * uint256 deposit)
 */
export type StreamFlowUpdatedExtensionEvent = CommonEvent & {
  type: EVMEventType.FlowUpdatedExtension
  flowOperator: string
  deposit: string // uint256 hex
  depositNum?: number
  depositBN?: BN
}

export type EVMEvent =
  | ERC20TransferEvent
  | StreamFlowUpdatedEvent
  | StreamFlowUpdatedExtensionEvent

// ------------------------

export type ERC20Balance = CommonBalance

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
  deposit: string // uint256 hex
  depositNum?: number
  depositBN?: BN
  updates: number
}

export enum EventSignature {
  Transfer = 'Transfer(address,address,uint256)',
  FlowUpdated = 'FlowUpdated(address,address,address,int96,int256,int256,bytes)',
  FlowUpdatedExtension = 'FlowUpdatedExtension(address,uint256)',
}

// -------------------------
