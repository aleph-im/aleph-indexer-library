/* eslint-disable prefer-const */
import { EntityStorage } from '@aleph-indexer/core'
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  AccountIndexerRequestArgs,
  ParserContext,
} from '@aleph-indexer/framework'
import {
  EthereumLogIndexerWorkerDomainI,
  EthereumParsedLog,
} from '@aleph-indexer/ethereum'
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
  implements EthereumLogIndexerWorkerDomainI
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
    const eventSignature = entity.parsed?.signature
    return (
      eventSignature === EventType.Message || eventSignature === EventType.Sync
    )
  }

  async ethereumIndexLogs(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    console.log('Index ethereum logs', JSON.stringify(entities, null, 2))

    const parsedMessageEvents: MessageEvent[] = []
    const parsedSyncEvents: SyncEvent[] = []

    for (const entity of entities) {
      const eventSignature = entity.parsed?.signature

      if (eventSignature === EventType.Message) {
        const parsed = this.parser.parseMessageEvent(entity)
        parsedMessageEvents.push(parsed)
      } else {
        const parsed = this.parser.parseSyncEvent(entity)
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
    let { startDate, endDate, startHeight, endHeight, ...opts } = args
    opts.reverse = opts.reverse !== undefined ? opts.reverse : true

    let skip = opts.skip || 0
    const limit = opts.limit || 1000
    const result: Event[] = []

    let events

    if (!events && (startDate !== undefined || endDate !== undefined)) {
      startDate = startDate !== undefined ? startDate : 0
      endDate = endDate !== undefined ? endDate : Date.now()

      events = await dal
        .useIndex(SyncEventDALIndex.Timestamp)
        .getAllValuesFromTo([startDate], [endDate], opts)
    }

    if (!events && (startHeight !== undefined || endDate !== undefined)) {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      events = await dal
        .useIndex(SyncEventDALIndex.Height)
        .getAllValuesFromTo([startHeight], [endHeight], opts)
    }

    if (!events) {
      events = await dal.getAllValues(opts)
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
