import MainDomain from '../domain/main.js'
import {
  Balance,
  BalanceQueryArgs,
  TransferEvent,
  TransferEventQueryArgs,
} from '../types.js'

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getEvents(args: TransferEventQueryArgs): Promise<TransferEvent[]> {
    return this.domain.getEvents(args)
  }

  async getBalances(args: BalanceQueryArgs): Promise<Balance[]> {
    return this.domain.getBalances(args)
  }
}
