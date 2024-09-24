import MainDomain from '../domain/main.js'
import {
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
  CommonBalance,
  CommonEvent,
} from '../types/common.js'
import {
  ERC20Balance,
  ERC20TransferEvent,
  StreamFlowUpdatedEvent,
  StreamBalance,
  StreamFlowUpdatedExtensionEvent,
} from '../types/evm.js'

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getTransferEvents(
    args: CommonEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    return this.domain.getTransferEvents(args)
  }

  async getFlowUpdatedEvents(
    args: CommonEventQueryArgs,
  ): Promise<StreamFlowUpdatedEvent[]> {
    return this.domain.getFlowUpdatedEvents(args)
  }

  async getFlowUpdatedExtensionEvents(
    args: CommonEventQueryArgs,
  ): Promise<StreamFlowUpdatedExtensionEvent[]> {
    return this.domain.getFlowUpdatedExtensionEvents(args)
  }

  async getEvents(args: CommonEventQueryArgs): Promise<CommonEvent[]> {
    return this.domain.getEvents(args)
  }

  async getERC20Balances(
    args: CommonBalanceQueryArgs,
  ): Promise<ERC20Balance[]> {
    return this.domain.getERC20Balances(args)
  }

  async getStreamBalances(
    args: CommonBalanceQueryArgs,
  ): Promise<StreamBalance[]> {
    return this.domain.getStreamBalances(args)
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<CommonBalance[]> {
    return this.domain.getBalances(args)
  }
}
