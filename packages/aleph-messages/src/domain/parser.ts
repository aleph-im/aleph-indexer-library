import { Blockchain } from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import { AlephEvent, MessageEvent, SyncEvent } from '../types'

export class EventParser {
  parseMessageEvent(
    blockchainId: Blockchain,
    entity: EthereumParsedLog,
  ): MessageEvent {
    const parsedEvent = this.parseCommonSchemma(blockchainId, entity)

    const [, , type, rawContent] = entity.parsed?.args || []
    const content = String(rawContent)

    return {
      ...parsedEvent,
      type,
      content,
    }
  }

  parseSyncEvent(
    blockchainId: Blockchain,
    entity: EthereumParsedLog,
  ): SyncEvent {
    const parsedEvent = this.parseCommonSchemma(blockchainId, entity)

    const [, , rawMessage] = entity.parsed?.args || []
    const message = String(rawMessage)

    return {
      ...parsedEvent,
      message,
    }
  }

  protected parseCommonSchemma(
    blockchain: Blockchain,
    entity: EthereumParsedLog,
  ): AlephEvent {
    const [rawTimestamp, address] = entity.parsed?.args || []
    const id = `${blockchain}_${entity.id}`
    const timestamp = this.parseTimestampBN(rawTimestamp)
    const { height, transactionHash: transaction } = entity

    return {
      blockchain,
      id,
      timestamp,
      height,
      address,
      transaction,
    }
  }

  protected parseTimestampBN(rawTimestamp: { hex: string }): number {
    return Number.parseInt(rawTimestamp.hex, 16) * 1000
  }
}
