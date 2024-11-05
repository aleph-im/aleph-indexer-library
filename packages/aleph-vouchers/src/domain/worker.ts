import path from 'node:path'
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  AccountIndexerRequestArgs,
  ParserContext,
  BlockchainId,
  getBlockchainConfig,
} from '@aleph-indexer/framework'
import {
  EthereumLogIndexerWorkerDomainI,
  EthereumParsedLog,
} from '@aleph-indexer/ethereum'
import { BscLogIndexerWorkerDomainI, BscParsedLog } from '@aleph-indexer/bsc'
import {
  AvalancheLogIndexerWorkerDomainI,
  AvalancheParsedLog,
} from '@aleph-indexer/avalanche'
import { BaseLogIndexerWorkerDomainI, BaseParsedLog } from '@aleph-indexer/base'
import {
  SolanaIndexerWorkerDomainI,
  SolanaParsedInstructionContext,
} from '@aleph-indexer/solana'
import blockchainWorkerClass from './worker/index.js'
import {
  BlockchainWorkerI,
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
  CommonBalance,
  CommonEvent,
  CommonTokenQueryArgs,
  CommonToken,
} from '../types/common.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements
    EthereumLogIndexerWorkerDomainI,
    AvalancheLogIndexerWorkerDomainI,
    BaseLogIndexerWorkerDomainI,
    BscLogIndexerWorkerDomainI,
    SolanaIndexerWorkerDomainI
{
  constructor(
    protected context: IndexerDomainContext,
    protected blockchainWorker: Record<BlockchainId, BlockchainWorkerI> = {},
  ) {
    super(context)
    const { supportedBlockchains } = this.context

    for (const blockchain of supportedBlockchains) {
      const { id, chain } = getBlockchainConfig(blockchain)

      const clazz = blockchainWorkerClass[chain]
      if (!clazz) throw new Error(`Worker not implemented for ${chain}`)

      const dataPath = path.join(context.dataPath, id)
      this.blockchainWorker[id] = new clazz({ ...context, dataPath })
    }
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    const worker = this.blockchainWorker[config.blockchainId]
    return worker.onNewAccount(config)
  }

  async ethereumFilterLog(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.filterEntity(context, entity)
  }

  async avalancheFilterLog(
    context: ParserContext,
    entity: AvalancheParsedLog,
  ): Promise<boolean> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.filterEntity(context, entity)
  }

  async bscFilterLog(
    context: ParserContext,
    entity: BscParsedLog,
  ): Promise<boolean> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.filterEntity(context, entity)
  }

  async baseFilterLog(
    context: ParserContext,
    entity: BaseParsedLog,
  ): Promise<boolean> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.filterEntity(context, entity)
  }

  async solanaFilterInstruction(
    context: ParserContext,
    entity: SolanaParsedInstructionContext,
  ): Promise<boolean> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.filterEntity(context, entity)
  }

  // ---

  async ethereumIndexLogs(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.indexEntities(context, entities)
  }

  async avalancheIndexLogs(
    context: ParserContext,
    entities: AvalancheParsedLog[],
  ): Promise<void> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.indexEntities(context, entities)
  }

  async bscIndexLogs(
    context: ParserContext,
    entities: BscParsedLog[],
  ): Promise<void> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.indexEntities(context, entities)
  }

  async baseIndexLogs(
    context: ParserContext,
    entities: BaseParsedLog[],
  ): Promise<void> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.indexEntities(context, entities)
  }

  async solanaIndexInstructions(
    context: ParserContext,
    entities: SolanaParsedInstructionContext[],
  ): Promise<void> {
    const worker = this.blockchainWorker[context.blockchainId]
    return worker.indexEntities(context, entities)
  }

  // API methods

  async getBalances(
    account: string,
    args: CommonBalanceQueryArgs,
  ): Promise<CommonBalance[]> {
    const worker = this.blockchainWorker[args.blockchain]
    return worker.getBalances(args)
  }

  async getTokens(
    account: string,
    args: CommonTokenQueryArgs,
  ): Promise<CommonToken[]> {
    const worker = this.blockchainWorker[args.blockchain]
    return worker.getTokens(args)
  }

  async getEvents(
    account: string,
    args: CommonEventQueryArgs,
  ): Promise<CommonEvent[]> {
    const worker = this.blockchainWorker[args.blockchain]
    return worker.getEvents(args)
  }
}
