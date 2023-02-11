/* eslint-disable prefer-const */
import { EntityStorage } from '@aleph-indexer/core'
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  AccountIndexerRequestArgs,
  ParserContext,
  Blockchain,
} from '@aleph-indexer/framework'
import {
  EthereumLogIndexerWorkerDomainI,
  EthereumParsedLog,
} from '@aleph-indexer/ethereum'
import { BscLogIndexerWorkerDomainI, BscParsedLog } from '@aleph-indexer/bsc'
import {
  EventType,
  MessageEvent,
  MessageEventQueryArgs,
  SyncEvent,
  SyncEventQueryArgs,
} from '../types.js'
import { createMessageEventDAL } from '../dal/messageEvent.js'
import { createSyncEventDAL, SyncEventDALIndex } from '../dal/syncEvent.js'
import { EventParser } from './parser.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements EthereumLogIndexerWorkerDomainI, BscLogIndexerWorkerDomainI
{
  constructor(
    protected context: IndexerDomainContext,
    protected messageEventDAL = createMessageEventDAL(context.dataPath),
    protected syncEventDAL = createSyncEventDAL(context.dataPath),
    protected parser = new EventParser(),
  ) {
    super(context)
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    const { account } = config
    const { instanceName } = this.context
    console.log('Account indexing', instanceName, account)
  }

  async ethereumFilterLog(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(Blockchain.Ethereum, context, entity)
  }

  async bscFilterLog(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(Blockchain.Bsc, context, entity)
  }

  async ethereumIndexLogs(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(Blockchain.Ethereum, context, entities)
  }

  async bscIndexLogs(
    context: ParserContext,
    entities: BscParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(Blockchain.Bsc, context, entities)
  }

  protected async filterEVMLog(
    blockchainId: Blockchain,
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    const eventSignature = entity.parsed?.signature

    console.log(`Filter ${blockchainId} logs`, eventSignature)

    return (
      eventSignature === EventType.Message || eventSignature === EventType.Sync
    )
  }

  protected async indexEVMLogs(
    blockchainId: Blockchain,
    context: ParserContext,
    entities: BscParsedLog[],
  ): Promise<void> {
    console.log(`Index ${blockchainId} logs`, JSON.stringify(entities, null, 2))

    const parsedMessageEvents: MessageEvent[] = []
    const parsedSyncEvents: SyncEvent[] = []

    for (const entity of entities) {
      const eventSignature = entity.parsed?.signature

      if (eventSignature === EventType.Message) {
        const parsed = this.parser.parseMessageEvent(blockchainId, entity)
        parsedMessageEvents.push(parsed)
      } else {
        const parsed = this.parser.parseSyncEvent(blockchainId, entity)
        parsedSyncEvents.push(parsed)
      }
    }

    if (parsedMessageEvents.length) {
      await this.messageEventDAL.save(parsedMessageEvents)
    }

    if (parsedSyncEvents.length) {
      await this.syncEventDAL.save(parsedSyncEvents)
    }
  }

  // API methods

  async getMessageEvents(
    account: string,
    args: MessageEventQueryArgs,
  ): Promise<MessageEvent[]> {
    return this.getEvents(args, this.messageEventDAL)
  }

  async getSyncEvents(
    account: string,
    args: SyncEventQueryArgs,
  ): Promise<SyncEvent[]> {
    return this.getEvents(args, this.syncEventDAL)
  }

  protected async getEvents<
    Args extends MessageEventQueryArgs | SyncEventQueryArgs,
    Event extends MessageEvent | SyncEvent,
  >(args: Args, dal: EntityStorage<Event>): Promise<Event[]> {
    let { startDate, endDate, startHeight, endHeight, blockchain, ...opts } =
      args

    opts.reverse = opts.reverse !== undefined ? opts.reverse : true

    let skip = opts.skip || 0
    const limit = opts.limit || 1000
    const result: Event[] = []

    let events

    if (!events && (startDate !== undefined || endDate !== undefined)) {
      startDate = startDate !== undefined ? startDate : 0
      endDate = endDate !== undefined ? endDate : Date.now()

      events = await dal
        .useIndex(SyncEventDALIndex.BlockchainTimestamp)
        .getAllValuesFromTo(
          [blockchain, startDate],
          [blockchain, endDate],
          opts,
        )
    }

    if (!events && (startHeight !== undefined || endDate !== undefined)) {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      events = await dal
        .useIndex(SyncEventDALIndex.BlockchainHeight)
        .getAllValuesFromTo(
          [blockchain, startHeight],
          [blockchain, endHeight],
          opts,
        )
    }

    if (!events) {
      events = await dal
        .useIndex(SyncEventDALIndex.BlockchainHeight)
        .getAllValuesFromTo([blockchain], [blockchain], opts)
    }

    for await (const message of events) {
      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(message)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }
}
