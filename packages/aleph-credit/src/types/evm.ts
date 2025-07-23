import { CommonTransfer } from './common'
import { PaymentMethod, ProviderId } from './provider'

export enum EVMEventType {
  Transfer = 'transfer',
}

/**
 * Transfer (
 * index_topic_1 address from,
 * index_topic_2 address to,
 * uint256 value)
 */
export type ERC20TransferEvent = CommonTransfer & {
  type: EVMEventType.Transfer
  provider: ProviderId
  paymentMethod?: PaymentMethod
  origin?: string
  ref?: string
}

export enum EventSignature {
  Transfer = 'Transfer(address,address,uint256)',
}
