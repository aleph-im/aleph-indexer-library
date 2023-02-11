import { Blockchain } from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import { MessageEvent, SyncEvent } from '../types'

export class EventParser {
  parseMessageEvent(
    blockchainId: Blockchain,
    entity: EthereumParsedLog,
  ): MessageEvent {
    const parsedEvent = this.parseCommonSchemma(blockchainId, entity)

    const [, , type, rawContent] = entity.parsed?.args || []
    const content = this.parseJsonContentOrString(rawContent)

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
    const message = this.parseJsonContentOrString(rawMessage)

    return {
      ...parsedEvent,
      message,
    }
  }

  protected parseCommonSchemma(
    blockchain: Blockchain,
    entity: EthereumParsedLog,
  ): any {
    const [rawTimestamp, address] = entity.parsed?.args || []
    const id = `${blockchain}_${entity.id}`
    const height = entity.height
    const timestamp = this.parseTimestampBN(rawTimestamp)

    return {
      blockchain,
      id,
      timestamp,
      height,
      address,
    }
  }

  protected parseJsonContentOrString(rawContent: string): string | object {
    let parsedContent: string | object

    try {
      parsedContent = JSON.parse(rawContent)
    } catch (e) {
      parsedContent = String(rawContent)
    }

    return parsedContent
  }

  protected parseTimestampBN(rawTimestamp: { hex: string }): number {
    return Number.parseInt(rawTimestamp.hex, 16) * 1000
  }
}
