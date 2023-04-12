import { Blockchain } from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import { SolanaParsedInstructionContext } from '@aleph-indexer/solana'
import { AlephEvent, MessageEvent, SolanaEvents, SolanaMessageEvent, SolanaMessageSync, SyncEvent } from '../types.js'
import { EventParser as AnchorEventParser, BorshCoder } from '@coral-xyz/anchor'
import { SOLANA_MESSAGES_PROGRAM_IDL, SOLANA_MESSAGES_PROGRAM_ID_PK } from '../constants.js'

export class EventParser {
  protected anchorEventParser = new AnchorEventParser(SOLANA_MESSAGES_PROGRAM_ID_PK, new BorshCoder(SOLANA_MESSAGES_PROGRAM_IDL))

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

  parseSolanaMessages(
    blockchain: Blockchain,
    entities: SolanaParsedInstructionContext[],
  ){
    const parsedMessageEvents: MessageEvent[] = []
    const parsedSyncEvents: SyncEvent[] = []

    for (const entity of entities) {
      if (entity.parentTransaction.meta?.logMessages) {
        const logs = this.anchorEventParser.parseLogs(entity.parentTransaction.meta?.logMessages) as unknown as SolanaEvents[]
        for (const log of logs) {
          if (this.isSolanaMessageEvent(log)) {
            parsedMessageEvents.push({
              blockchain: blockchain,
              id: `${blockchain}_${entity.parentTransaction.id}`,
              timestamp: entity.parentTransaction.blockTime || 0,
              height: entity.parentTransaction.slot,
              transaction: entity.parentTransaction.signature,
              address: log.data.address.toString(),
              type: log.data.msgtype,
              content: log.data.msgcontent
            })
          } else {
            if (this.isSolanaSyncEvent(log)) {
              parsedSyncEvents.push({
                blockchain: blockchain,
                id: `${blockchain}_${entity.parentTransaction.id}`,
                timestamp: entity.parentTransaction.blockTime || 0,
                height: entity.parentTransaction.slot,
                transaction: entity.parentTransaction.signature,
                address: log.data.address.toString(),
                message: log.data.message,
              })
            }
          }
        }
      }
    }

    return { parsedMessageEvents, parsedSyncEvents }
  }

  protected isSolanaMessageEvent(event: any): event is SolanaMessageEvent {
    return event.data.msgtype !== undefined
  }

  protected isSolanaSyncEvent(event: any): event is SolanaMessageSync {
    return event.data.message !== undefined
  }
}
