/* eslint-disable prefer-const */
import {
  IndexerDomainContext,
  AccountIndexerRequestArgs,
  ParserContext,
} from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import {
  EventSignature,
  ERC20TransferEvent,
  EVMEventType,
} from '../../types/evm.js'
import { EVMEventParser } from '../parser/evm.js'
import {
  blockchainAlephCreditContractMap,
  BlockchainId,
  providerAddressMap,
} from '../../utils/index.js'
import {
  BlockchainWorkerI,
  CommonTransfer,
  CommonTransferQueryArgs,
  CommonTransfersQueryArgs,
} from '../../types/common.js'
import {
  getCommonEvent,
  getCommonEvents,
  getPendingEvents,
} from '../../utils/query.js'
import {
  createERC20TransferEventDAL,
  ERC20TransferEventDALIndex,
} from '../../dal/evm/erc20TransferEvent.js'
import { PendingWork, Utils } from '@aleph-indexer/core'
import { createERC20PendingTransferEventDAL } from '../../dal/evm/erc20PendingTransferEvent.js'
import { getPaymentDetailMessage } from '../../utils/aleph.js'
import { PaymentMethod, ProviderId } from '../../types/provider.js'

export default class EVMWorkerDomain implements BlockchainWorkerI {
  constructor(
    protected context: IndexerDomainContext,
    protected pendingTransferEvents: Utils.PendingWorkPool<ERC20TransferEvent>,
    protected parser = new EVMEventParser(),
    protected erc20TransferEventDAL = createERC20TransferEventDAL(
      context.dataPath,
    ),
    protected erc20PendingTransferEventDAL = createERC20PendingTransferEventDAL(
      context.dataPath,
    ),
  ) {
    this.pendingTransferEvents = new Utils.PendingWorkPool<ERC20TransferEvent>({
      id: `pending-transfer-events`,
      interval: 1000 * 10,
      chunkSize: 1000,
      concurrency: 1,
      dal: this.erc20PendingTransferEventDAL,
      handleWork: this.handlePendingTransferEvents.bind(this),
      checkComplete: this.checkCompletePendingTransferEvents.bind(this),
    })
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    console.log(`Indexing`, JSON.stringify(config))

    // @note: Run in background to let the API to initialize
    this.pendingTransferEvents.start()
  }

  async filterEntity(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    const { blockchainId } = context
    const eventSignature = entity.parsed?.signature

    console.log(
      `Filter ${blockchainId} logs`,
      eventSignature,
      entity.timestamp,
      entity.logIndex,
    )

    const toAddress = entity.parsed?.args[1]

    return (
      eventSignature === EventSignature.Transfer &&
      toAddress ===
        blockchainAlephCreditContractMap[blockchainId as BlockchainId]
    )
  }

  async indexEntities(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    const { blockchainId } = context
    console.log(`Index ${blockchainId} logs`, JSON.stringify(entities, null, 2))

    const parsedTransferEvents: ERC20TransferEvent[] = []

    for (const entity of entities) {
      const parsedEvent = this.parser.parseEvent(
        blockchainId as BlockchainId,
        entity,
      )
      console.log('parsedEvent', parsedEvent)
      if (!parsedEvent) continue

      switch (parsedEvent.type) {
        case EVMEventType.Transfer: {
          parsedTransferEvents.push(parsedEvent)
          break
        }
      }
    }

    if (parsedTransferEvents.length) {
      const events = await this.processTransferEvents(parsedTransferEvents)
      await this.erc20TransferEventDAL.save(events)
    }
  }

  async getTransfers(
    args: CommonTransfersQueryArgs,
  ): Promise<CommonTransfer[]> {
    return getCommonEvents(
      args,
      this.erc20TransferEventDAL,
      ERC20TransferEventDALIndex,
    )
  }

  async getTransfer(
    args: CommonTransferQueryArgs,
  ): Promise<CommonTransfer | undefined> {
    return getCommonEvent(
      args,
      this.erc20TransferEventDAL,
      ERC20TransferEventDALIndex,
    )
  }

  async getPendingTransfers(
    args: CommonTransfersQueryArgs,
  ): Promise<CommonTransfer[]> {
    return getPendingEvents(args, this.erc20PendingTransferEventDAL)
  }

  // -------------------

  protected async processTransferEvents(
    transfers: ERC20TransferEvent[],
  ): Promise<ERC20TransferEvent[]> {
    return this.lookupProviderOriginAddress(transfers)
  }

  // @todo: Batch lookup in credit api
  private async lookupProviderOriginAddress(
    transfers: ERC20TransferEvent[],
  ): Promise<ERC20TransferEvent[]> {
    let result = []

    for (const transfer of transfers) {
      const post = await getPaymentDetailMessage(transfer.transaction)
      console.log(`payment of ${transfer.transaction}`, post)

      // @note: If there is a payment post update related info
      if (post) {
        const { payment } = post.content

        if (transfer.from != payment.user_address) {
          transfer.origin = transfer.from
          transfer.from = payment.user_address
        }

        transfer.provider = payment.provider_id
        transfer.paymentMethod = payment.payment_method
        transfer.ref = post.hash
        transfer.updated =
          typeof payment.updated_at === 'string'
            ? new Date(payment.updated_at).valueOf()
            : payment.updated_at

        result.push(transfer)
        continue
      }

      const providerId = providerAddressMap[transfer.from]

      // @note: If the transfer comes from a non-provider address and there is no payment post,
      // it could have been a direct transfer using the blockchain
      if (!providerId) {
        transfer.provider = ProviderId.WALLET
        transfer.paymentMethod = PaymentMethod.TokenTransfer
        result.push(transfer)
        continue
      }

      // @note: If the transfer comes from a provider address and there is no payment post
      // we should wait for the provider to update the payment detail in aleph
      await this.pendingTransferEvents.addWork({
        id: transfer.id,
        time: transfer.timestamp,
        payload: transfer,
      })
    }

    console.log(
      `Processed ${result.length} valid transfers of ${transfers.length}`,
    )

    return result
  }

  protected async handlePendingTransferEvents(
    works: PendingWork<ERC20TransferEvent>[],
  ): Promise<void> {
    try {
      const transfers = works.map((work) => work.payload)
      const validTransfers = await this.processTransferEvents(transfers)

      console.log(
        `Updated ${validTransfers.length} valid transfers of ${transfers}`,
      )
      await this.erc20TransferEventDAL.save(validTransfers)
    } catch (e) {
      console.log(e)
    }
  }

  protected async checkCompletePendingTransferEvents(
    work: PendingWork<ERC20TransferEvent>,
  ): Promise<boolean> {
    return this.erc20TransferEventDAL.exists(work.payload.id)
  }
}
