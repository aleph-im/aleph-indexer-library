import { BlockchainId } from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import {
  ERC20Balance,
  ERC20TransferEvent,
  EVMEvent,
  EventSignature,
  EVMEventType,
  StreamFlowUpdatedEvent,
  StreamFlowUpdatedExtensionEvent,
} from '../../types/evm.js'
import {
  bigNumberToUint256,
  hexStringToBigNumber,
  hexStringToInt96,
  hexStringToUint256,
} from '../../utils/index.js'
import { CommonEvent } from '../../types/common.js'

export class EVMEventParser {
  parseBalance(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): ERC20Balance[] {
    const event = this.parseEvent(blockchain, entity)
    if (!event) return []

    return this.parseBalanceFromEvent(event)
  }

  parseBalanceFromEvent(event: EVMEvent): ERC20Balance[] {
    if (event.type !== EVMEventType.Transfer) return []

    const { blockchain, from, to, value } = event

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

  parseEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): EVMEvent | undefined {
    const eventSignature = entity.parsed?.signature

    switch (eventSignature) {
      case EventSignature.Transfer: {
        return this.parseERC20TransferEvent(blockchain, entity)
      }
      case EventSignature.FlowUpdated: {
        return this.parseStreamFlowUpdatedEvent(blockchain, entity)
      }
      case EventSignature.FlowUpdatedExtension: {
        return this.parseStreamFlowUpdatedExtensionEvent(blockchain, entity)
      }
    }
  }

  protected parseERC20TransferEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): ERC20TransferEvent {
    const parsedEvent = this.parseCommonScheme(
      blockchain,
      entity,
      EVMEventType.Transfer,
    )

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

  protected parseStreamFlowUpdatedEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): StreamFlowUpdatedEvent {
    const parsedEvent = this.parseCommonScheme(
      blockchain,
      entity,
      EVMEventType.FlowUpdated,
    )

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

  protected parseStreamFlowUpdatedExtensionEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): StreamFlowUpdatedExtensionEvent {
    const parsedEvent = this.parseCommonScheme(
      blockchain,
      entity,
      EVMEventType.FlowUpdatedExtension,
    )

    const [rawflowOperator, rawDeposit] = entity.parsed?.args || []

    const flowOperator = String(rawflowOperator)
    const deposit = hexStringToUint256(rawDeposit.hex)

    return {
      ...parsedEvent,
      flowOperator,
      deposit,
    } as StreamFlowUpdatedExtensionEvent
  }

  protected parseCommonScheme(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
    type: EVMEventType,
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
      type,
    }
  }
}
