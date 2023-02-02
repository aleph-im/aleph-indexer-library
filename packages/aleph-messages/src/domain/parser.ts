import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import { MessageEvent, SyncEvent } from '../types'

export class EventParser {
  parseMessageEvent(entity: EthereumParsedLog): MessageEvent {
    const parsedEvent = this.parseCommonSchemma(entity)

    const [, , type, rawContent] = entity.parsed?.args || []
    const content = this.parseJsonContentOrString(rawContent)

    return {
      ...parsedEvent,
      type,
      content,
    }
  }

  parseSyncEvent(entity: EthereumParsedLog): SyncEvent {
    const parsedEvent = this.parseCommonSchemma(entity)

    const [, , rawMessage] = entity.parsed?.args || []
    const message = this.parseJsonContentOrString(rawMessage)

    return {
      ...parsedEvent,
      message,
    }
  }

  protected parseCommonSchemma(entity: EthereumParsedLog): any {
    const [rawTimestamp, address] = entity.parsed?.args || []
    const id = entity.id
    const height = entity.height
    const timestamp = this.parseTimestampBN(rawTimestamp)

    return {
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
