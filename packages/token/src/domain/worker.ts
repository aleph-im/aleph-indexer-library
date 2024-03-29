/* eslint-disable prefer-const */
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  ParserContext,
  AccountIndexerConfigWithMeta,
  getBlockchainConfig,
  Blockchain,
} from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import {
  EventType,
  ERC20TransferEventQueryArgs,
  ERC20TransferEvent,
  BalanceQueryArgs,
  Balance,
  TokenAccount,
} from '../types.js'
import {
  ERC20TransferEventDALIndex,
  createERC20TransferEventDAL,
} from '../dal/erc20TransferEvent.js'
import { EventParser } from './parser.js'
import { BalanceDALIndex, createBalanceDAL } from '../dal/balance.js'
import { Utils } from '@aleph-indexer/core'

export default class WorkerDomain extends IndexerWorkerDomain {
  constructor(
    protected context: IndexerDomainContext,
    protected tokenConfig: Record<string, TokenAccount> = {},
    protected parser = new EventParser(),
    protected balanceDAL = createBalanceDAL(context.dataPath, tokenConfig),
    protected eventDAL = createERC20TransferEventDAL(
      context.dataPath,
      tokenConfig,
    ),
  ) {
    super(context)
  }

  async init(): Promise<void> {
    this.context.supportedBlockchains.map((blockchain) => {
      this.initBlockchainConfig(blockchain)
    })

    await super.init()
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<TokenAccount>,
  ): Promise<void> {
    const { blockchainId, account: contract, meta } = config
    const { instanceName } = this.context

    this.tokenConfig[blockchainId] = meta

    const { deployer, supply } = meta
    const accountBalance = await this.balanceDAL.get([blockchainId, deployer])

    console.log(
      '✅ Indexing account',
      instanceName,
      blockchainId,
      contract,
      deployer,
      accountBalance,
    )

    // @note: Init the initial supply if it is the first it run
    if (!accountBalance) {
      const balance = supply.toString('hex')
      await this.balanceDAL.save({
        blockchain: blockchainId,
        account: deployer,
        balance,
      })

      console.log('Init supply', blockchainId, deployer, balance)
    }
  }

  initBlockchainConfig(this: any, blockchain: Blockchain): void {
    const { id } = getBlockchainConfig(blockchain)
    const blockchainId = Utils.toCamelCase(id)

    if (this[`${blockchainId}FilterLog`]) return

    this[`${blockchainId}FilterLog`] = this.filterEVMLog.bind(this)
    this[`${blockchainId}IndexLogs`] = this.indexEVMLogs.bind(this)
  }

  protected async filterEVMLog(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    const { blockchainId } = context
    const eventSignature = entity.parsed?.signature

    console.log(`Filter ${blockchainId} logs`, eventSignature)

    return eventSignature === EventType.Transfer
  }

  protected async indexEVMLogs(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    const { blockchainId } = context

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
      await this.eventDAL.save(parsedEvents)
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
    let {
      startDate,
      endDate,
      startHeight,
      endHeight,
      blockchain,
      account: acc,
      ...opts
    } = args

    console.log('QUERY EVENTS ', account, args)

    opts.reverse = opts.reverse !== undefined ? opts.reverse : true

    let skip = opts.skip || 0
    const limit = opts.limit || 1000
    const result: ERC20TransferEvent[] = []

    let entries

    if (!entries && acc) {
      if (startDate !== undefined || endDate !== undefined) {
        startDate = startDate !== undefined ? startDate : 0
        endDate = endDate !== undefined ? endDate : Date.now()

        entries = await this.eventDAL
          .useIndex(ERC20TransferEventDALIndex.BlockchainAccountTimestamp)
          .getAllValuesFromTo(
            [blockchain, acc, startDate],
            [blockchain, acc, endDate],
            opts,
          )
      } else {
        startHeight = startHeight !== undefined ? startHeight : 0
        endHeight =
          endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

        entries = await this.eventDAL
          .useIndex(ERC20TransferEventDALIndex.BlockchainAccountHeight)
          .getAllValuesFromTo(
            [blockchain, acc, startHeight],
            [blockchain, acc, endHeight],
            opts,
          )
      }
    }

    if (!entries && (startDate !== undefined || endDate !== undefined)) {
      startDate = startDate !== undefined ? startDate : 0
      endDate = endDate !== undefined ? endDate : Date.now()

      entries = await this.eventDAL
        .useIndex(ERC20TransferEventDALIndex.BlockchainTimestamp)
        .getAllValuesFromTo(
          [blockchain, startDate],
          [blockchain, endDate],
          opts,
        )
    }

    if (!entries) {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      entries = await this.eventDAL
        .useIndex(ERC20TransferEventDALIndex.BlockchainHeight)
        .getAllValuesFromTo(
          [blockchain, startHeight],
          [blockchain, endHeight],
          opts,
        )
    }

    for await (const entry of entries) {
      // @note: Skip first N entries
      if (--skip >= 0) continue

      result.push(entry)

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

    console.log('QUERY BALANCE ', account, args)

    opts.reverse = opts.reverse !== undefined ? opts.reverse : true

    let skip = opts.skip || 0
    const limit = opts.limit || 1000
    const result: Balance[] = []

    let entries

    if (!entries && acc) {
      entries = await this.balanceDAL.getAllValuesFromTo(
        [blockchain, acc],
        [blockchain, acc],
        opts,
      )
    }

    if (!entries) {
      entries = await this.balanceDAL
        .useIndex(BalanceDALIndex.BlockchainBalance)
        .getAllValuesFromTo([blockchain], [blockchain], opts)
    }

    for await (const entry of entries) {
      // @note: Skip first N entries
      if (--skip >= 0) continue

      result.push(entry)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }
}
