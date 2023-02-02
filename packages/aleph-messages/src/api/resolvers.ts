import MainDomain from '../domain/main.js'
import {
  MessageEvent,
  MessageEventQueryArgs,
  SyncEvent,
  SyncEventQueryArgs,
} from '../types.js'

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getMessageEvents(args: MessageEventQueryArgs): Promise<MessageEvent[]> {
    return this.domain.getMessageEvents(args)
  }

  async getSyncEvents(args: SyncEventQueryArgs): Promise<SyncEvent[]> {
    return this.domain.getSyncEvents(args)
  }
}
