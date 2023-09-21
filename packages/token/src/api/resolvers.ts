import MainDomain from '../domain/main.js'
import {
  Balance,
  BalanceQueryArgs,
  ERC20TransferEvent,
  ERC20TransferEventQueryArgs,
} from '../types.js'

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getEvents(
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    return this.domain.getEvents(args)
  }

  async getBalances(args: BalanceQueryArgs): Promise<Balance[]> {
    return this.domain.getBalances(args)
  }
}
