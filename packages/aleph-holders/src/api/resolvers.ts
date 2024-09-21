import MainDomain from '../domain/main.js'
import { CommonBalanceQueryArgs, Balance } from '../types/common.js'
import {
  ERC20Balance,
  ERC20TransferEvent,
  ERC20TransferEventQueryArgs,
  StreamFlowUpdatedEvent,
  StreamFlowUpdatedEventQueryArgs,
  ERC20BalanceQueryArgs,
  StreamBalanceQueryArgs,
  StreamBalance,
  StreamFlowUpdatedExtensionEventQueryArgs,
  StreamFlowUpdatedExtensionEvent,
} from '../types/evm.js'

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getTransferEvents(
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    return this.domain.getTransferEvents(args)
  }

  async getFlowUpdatedEvents(
    args: StreamFlowUpdatedEventQueryArgs,
  ): Promise<StreamFlowUpdatedEvent[]> {
    return this.domain.getFlowUpdatedEvents(args)
  }

  async getFlowUpdatedExtensionEvents(
    args: StreamFlowUpdatedExtensionEventQueryArgs,
  ): Promise<StreamFlowUpdatedExtensionEvent[]> {
    return this.domain.getFlowUpdatedExtensionEvents(args)
  }

  async getERC20Balances(args: ERC20BalanceQueryArgs): Promise<ERC20Balance[]> {
    return this.domain.getERC20Balances(args)
  }

  async getStreamBalances(
    args: StreamBalanceQueryArgs,
  ): Promise<StreamBalance[]> {
    return this.domain.getStreamBalances(args)
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<Balance[]> {
    return this.domain.getBalances(args)
  }
}
