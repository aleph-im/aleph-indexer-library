import MainDomain from '../domain/main.js'
import {
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
  CommonBalance,
  CommonEvent,
  CommonTokenQueryArgs,
  CommonToken,
} from '../types/common.js'

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getEvents(args: CommonEventQueryArgs): Promise<CommonEvent[]> {
    return this.domain.getEvents(args)
  }

  async getTokens(args: CommonTokenQueryArgs): Promise<CommonToken[]> {
    return this.domain.getTokens(args)
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<CommonBalance[]> {
    return this.domain.getBalances(args)
  }
}
