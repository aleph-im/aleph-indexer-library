import MainDomain from '../domain/main.js'
import {
  CommonQueryArgs,
  CommonTransfer,
  CommonTransferQueryArgs,
  CommonTransfersQueryArgs,
} from '../types/common.js'

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getTransfers(
    args: CommonTransfersQueryArgs,
  ): Promise<CommonTransfer[]> {
    return this.domain.getTransfers(args)
  }

  async getTransfer(
    args: CommonTransferQueryArgs,
  ): Promise<CommonTransfer | undefined> {
    return this.domain.getTransfer(args)
  }

  async getPendingTransfers(args: CommonQueryArgs): Promise<CommonTransfer[]> {
    return this.domain.getPendingTransfers(args)
  }
}
