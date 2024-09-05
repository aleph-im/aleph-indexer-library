import { BlockchainId } from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import {
  CommonEvent,
  ERC20Balance,
  ERC20TransferEvent,
  StreamFlowUpdatedEvent,
  StreamFlowUpdatedExtensionEvent,
} from '../types.js'
import {
  bigNumberToUint256,
  hexStringToBigNumber,
  hexStringToInt96,
  hexStringToUint256,
} from '../utils/index.js'

export class EventParser {
  parseERC20TransferEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): ERC20TransferEvent {
    const parsedEvent = this.parseCommonScheme(blockchain, entity)

    const [rawFrom, rawTo, rawValue] = entity.parsed?.args || []

    const from = String(rawFrom)
    const to = String(rawTo)
    const value = hexStringToUint256(rawValue.hex)

    return {
      ...parsedEvent,
      from,
      to,
      value,
    } as ERC20TransferEvent
  }

  parseStreamFlowUpdatedEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): StreamFlowUpdatedEvent {
    const parsedEvent = this.parseCommonScheme(blockchain, entity)

    const [
      ,
      // rawToken
      rawFrom,
      rawTo,
      rawFlowRate,
      // rawTotalSenderFlowRate,
      // rawTotalReceiverFlowRate,
      // rawUserData,
    ] = entity.parsed?.args || []

    const from = String(rawFrom)
    const to = String(rawTo)
    const flowRate = hexStringToInt96(rawFlowRate.hex)
    // const totalSenderFlowRate = uint256ToString(rawTotalSenderFlowRate.hex)
    // const totalReceiverFlowRate = uint256ToString(rawTotalReceiverFlowRate.hex)
    // const userData = String(rawUserData)

    return {
      ...parsedEvent,
      from,
      to,
      flowRate,
      // totalSenderFlowRate,
      // totalReceiverFlowRate,
      // userData,
    } as StreamFlowUpdatedEvent
  }

  parseStreamFlowUpdatedExtensionEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): StreamFlowUpdatedExtensionEvent {
    const parsedEvent = this.parseCommonScheme(blockchain, entity)

    const [rawflowOperator, rawDeposit] = entity.parsed?.args || []

    const flowOperator = String(rawflowOperator)
    const deposit = hexStringToUint256(rawDeposit.hex)

    return {
      ...parsedEvent,
      flowOperator,
      deposit,
    }
  }

  parseBalance(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): ERC20Balance[] {
    const { from, to, value } = this.parseERC20TransferEvent(blockchain, entity)

    const balances = [
      {
        blockchain,
        account: from,
        balance: bigNumberToUint256(hexStringToBigNumber(value).ineg()),
      },
      {
        blockchain,
        account: to,
        balance: value,
      },
    ]

    return balances
  }

  protected parseCommonScheme(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): CommonEvent {
    const timestamp = entity.timestamp
    const id = `${blockchain}_${entity.id}`
    const { height, transactionHash: transaction } = entity

    return {
      blockchain,
      id,
      timestamp,
      height,
      transaction,
    }
  }
}
