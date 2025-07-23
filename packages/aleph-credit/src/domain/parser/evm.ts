import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import {
  ERC20TransferEvent,
  EventSignature,
  EVMEventType,
} from '../../types/evm.js'
import { BlockchainId, hexStringToUint256 } from '../../utils/index.js'
import { CommonEvent } from '../../types/common.js'

export class EVMEventParser {
  parseEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): ERC20TransferEvent | undefined {
    const eventSignature = entity.parsed?.signature

    switch (eventSignature) {
      case EventSignature.Transfer: {
        return this.parseERC20TransferEvent(blockchain, entity)
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

  protected parseCommonScheme(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
    type: EVMEventType,
  ): CommonEvent {
    const timestamp = entity.timestamp
    const updated = timestamp
    const id = `${blockchain}_${entity.id}`
    const { height, transactionHash: transaction, logIndex: index } = entity
    const token = entity.address

    return {
      blockchain,
      token,
      id,
      timestamp,
      updated,
      height,
      index,
      transaction,
      type,
    }
  }
}
