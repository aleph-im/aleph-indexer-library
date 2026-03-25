import path from 'node:path'
import { Utils } from '@aleph-indexer/core'
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  AccountIndexerRequestArgs,
  ParserContext,
  getBlockchainConfig,
} from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import blockchainWorkerClass from './worker/index.js'
import {
  BlockchainWorkerI,
  CommonTransfersQueryArgs,
  CommonTransfer,
  CommonTransferQueryArgs,
  CommonQueryArgs,
} from '../types/common.js'

export default class WorkerDomain extends IndexerWorkerDomain {
  [method: string]: unknown

  constructor(
    protected context: IndexerDomainContext,
    protected blockchainWorker: Record<string, BlockchainWorkerI> = {},
  ) {
    super(context)
    const { supportedBlockchains } = this.context

    for (const blockchain of supportedBlockchains) {
      const { id, chain } = getBlockchainConfig(blockchain)

      const clazz = blockchainWorkerClass[chain]
      if (!clazz) throw new Error(`Worker not implemented for ${chain}`)

      const dataPath = path.join(context.dataPath, id)
      this.blockchainWorker[id] = new clazz({ ...context, dataPath })

      const prefix = Utils.toCamelCase(id)

      this[`${prefix}FilterLog`] = async (
        context: ParserContext,
        entity: EthereumParsedLog,
      ): Promise<boolean> => {
        const worker = this.blockchainWorker[context.blockchainId]
        return worker.filterEntity(context, entity)
      }

      this[`${prefix}IndexLogs`] = async (
        context: ParserContext,
        entities: EthereumParsedLog[],
      ): Promise<void> => {
        const worker = this.blockchainWorker[context.blockchainId]
        return worker.indexEntities(context, entities)
      }
    }
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    const worker = this.blockchainWorker[config.blockchainId]
    return worker.onNewAccount(config)
  }

  // API methods

  async getTransfers(
    account: string,
    args: CommonTransfersQueryArgs,
  ): Promise<CommonTransfer[]> {
    const worker = this.blockchainWorker[args.blockchain]
    return worker.getTransfers(args)
  }

  async getTransfer(
    account: string,
    args: CommonTransferQueryArgs,
  ): Promise<CommonTransfer | undefined> {
    const worker = this.blockchainWorker[args.blockchain]
    return worker.getTransfer(args)
  }

  async getPendingTransfers(
    account: string,
    args: CommonQueryArgs,
  ): Promise<CommonTransfer[]> {
    const worker = this.blockchainWorker[args.blockchain]
    return worker.getPendingTransfers(args)
  }
}
