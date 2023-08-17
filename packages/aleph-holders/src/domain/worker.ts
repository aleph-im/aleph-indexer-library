/* eslint-disable prefer-const */
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  AccountIndexerRequestArgs,
  ParserContext,
  BlockchainChain,
  BlockchainId,
} from '@aleph-indexer/framework'
import {
  EthereumLogIndexerWorkerDomainI,
  EthereumParsedLog,
} from '@aleph-indexer/ethereum'
import { BscLogIndexerWorkerDomainI, BscParsedLog } from '@aleph-indexer/bsc'
import {
  EventType,
  ERC20TransferEventQueryArgs,
  ERC20TransferEvent,
  BalanceQueryArgs,
  Balance,
} from '../types.js'
import {
  ERC20TransferEventDALIndex,
  createERC20TransferEventDAL,
} from '../dal/erc20TransferEvent.js'
import { EventParser } from './parser.js'
import { BalanceDALIndex, createBalanceDAL } from '../dal/balance.js'
import {
  blockchainDeployerAccount,
  blockchainTotalSupply,
} from '../utils/index.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements EthereumLogIndexerWorkerDomainI, BscLogIndexerWorkerDomainI
{
  constructor(
    protected context: IndexerDomainContext,
    protected erc20TransferEventDAL = createERC20TransferEventDAL(
      context.dataPath,
    ),
    protected balanceDAL = createBalanceDAL(context.dataPath),
    protected parser = new EventParser(),
  ) {
    super(context)
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    const { blockchainId: blockchain, account: contract } = config
    const { instanceName } = this.context

    const deployer = String(blockchainDeployerAccount[blockchain]).toLowerCase()
    const accountBalance = await this.balanceDAL.get([blockchain, deployer])

    console.log(
      'Account indexing',
      instanceName,
      blockchain,
      contract,
      deployer,
      accountBalance,
    )

    // @note: Init the initial supply if it is the first it run
    if (!accountBalance) {
      const balance = blockchainTotalSupply[blockchain].toString('hex')
      await this.balanceDAL.save({ blockchain, account: deployer, balance })

      console.log('Init supply', blockchain, deployer, balance)
    }
  }

  async ethereumFilterLog(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(BlockchainChain.Ethereum, context, entity)
  }

  async bscFilterLog(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(BlockchainChain.Bsc, context, entity)
  }

  async ethereumIndexLogs(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(BlockchainChain.Ethereum, context, entities)
  }

  async bscIndexLogs(
    context: ParserContext,
    entities: BscParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(BlockchainChain.Bsc, context, entities)
  }

  protected async filterEVMLog(
    blockchainId: BlockchainId,
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    const eventSignature = entity.parsed?.signature

    console.log(`Filter ${blockchainId} logs`, eventSignature)

    return eventSignature === EventType.Transfer
  }

  protected async indexEVMLogs(
    blockchainId: BlockchainId,
    context: ParserContext,
    entities: BscParsedLog[],
  ): Promise<void> {
    console.log(`Index ${blockchainId} logs`, JSON.stringify(entities, null, 2))

    const parsedEvents: ERC20TransferEvent[] = []
    const parsedBalances: Balance[] = []

    for (const entity of entities) {
      const parsedEvent = this.parser.parseERC20TransferEvent(
        blockchainId,
        entity,
      )
      parsedEvents.push(parsedEvent)

      const parsedBalance = this.parser.parseBalance(blockchainId, entity)
      parsedBalances.push(...parsedBalance)
    }

    if (parsedEvents.length) {
      await this.erc20TransferEventDAL.save(parsedEvents)
    }

    if (parsedBalances.length) {
      await this.balanceDAL.save(parsedBalances)
    }
  }

  // API methods

  protected async getEvents(
    account: string,
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    let { startDate, endDate, startHeight, endHeight, blockchain, ...opts } =
      args

    console.log('QUERY EVENTS ', args)

    opts.reverse = opts.reverse !== undefined ? opts.reverse : true

    let skip = opts.skip || 0
    const limit = opts.limit || 1000
    const result: ERC20TransferEvent[] = []

    let events

    if (!events && (startDate !== undefined || endDate !== undefined)) {
      startDate = startDate !== undefined ? startDate : 0
      endDate = endDate !== undefined ? endDate : Date.now()

      events = await this.erc20TransferEventDAL
        .useIndex(ERC20TransferEventDALIndex.BlockchainTimestamp)
        .getAllValuesFromTo(
          [blockchain, startDate],
          [blockchain, endDate],
          opts,
        )
    }

    if (!events && (startHeight !== undefined || endDate !== undefined)) {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      events = await this.erc20TransferEventDAL
        .useIndex(ERC20TransferEventDALIndex.BlockchainHeight)
        .getAllValuesFromTo(
          [blockchain, startHeight],
          [blockchain, endHeight],
          opts,
        )
    }

    if (!events) {
      events = await this.erc20TransferEventDAL
        .useIndex(ERC20TransferEventDALIndex.BlockchainHeight)
        .getAllValuesFromTo([blockchain], [blockchain], opts)
    }

    for await (const message of events) {
      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(message)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }

  protected async getBalances(
    account: string,
    args: BalanceQueryArgs,
  ): Promise<Balance[]> {
    let { blockchain, account: acc, ...opts } = args

    console.log('QUERY BALANCE ', args)

    opts.reverse = opts.reverse !== undefined ? opts.reverse : true

    let skip = opts.skip || 0
    const limit = opts.limit || 1000
    const result: Balance[] = []

    let events

    if (!events && acc) {
      events = await this.balanceDAL
        .useIndex(BalanceDALIndex.BlockchainAccount)
        .getAllValuesFromTo([blockchain, acc], [blockchain, acc], opts)
    }

    if (!events) {
      events = await this.balanceDAL
        .useIndex(BalanceDALIndex.BlockchainBalance)
        .getAllValuesFromTo([blockchain], [blockchain], opts)
    }

    for await (const message of events) {
      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(message)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }
}
