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
  CommonBalanceQueryArgs,
  ERC20Balance,
  StreamFlowUpdatedEvent,
  StreamFlowUpdatedEventQueryArgs,
  CommonEventQueryArgs,
  CommonEvent,
  StreamFlowUpdatedExtensionEvent,
  StreamBalance,
  CommonBalance,
  Balance,
} from '../types.js'
import {
  ERC20TransferEventDALIndex,
  createERC20TransferEventDAL,
} from '../dal/erc20TransferEvent.js'
import { EventParser } from './parser.js'
import {
  ERC20BalanceDALIndex,
  createERC20BalanceDAL,
} from '../dal/erc20Balance.js'
import {
  initialSupplyAccount,
  blockchainTotalSupply,
  blockchainTokenContract,
  bigNumberToString,
  uint256ToNumber,
  bigNumberToNumber,
  blockchainDecimals,
} from '../utils/index.js'
import {
  AvalancheLogIndexerWorkerDomainI,
  AvalancheParsedLog,
} from '@aleph-indexer/avalanche'
import { BaseLogIndexerWorkerDomainI, BaseParsedLog } from '@aleph-indexer/base'
import {
  StreamFlowUpdatedEventDALIndex,
  createStreamFlowUpdatedEventDAL,
} from '../dal/streamFlowUpdatedEvent.js'
import { EntityStorage, Utils } from '@aleph-indexer/core'
import { createStreamFlowUpdatedExtensionEventDAL } from '../dal/streamFlowUpdatedExtensionEvent.js'
import BN from 'bn.js'
import {
  StreamBalanceDALIndex,
  createStreamBalanceDAL,
} from '../dal/streamBalance.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements
    EthereumLogIndexerWorkerDomainI,
    AvalancheLogIndexerWorkerDomainI,
    BaseLogIndexerWorkerDomainI,
    BscLogIndexerWorkerDomainI
{
  constructor(
    protected context: IndexerDomainContext,
    protected erc20TransferEventDAL = createERC20TransferEventDAL(
      context.dataPath,
    ),
    protected streamFlowUpdatedEventDAL = createStreamFlowUpdatedEventDAL(
      context.dataPath,
    ),
    protected streamFlowUpdatedExtensionEventDAL = createStreamFlowUpdatedExtensionEventDAL(
      context.dataPath,
    ),
    protected erc20BalanceDAL = createERC20BalanceDAL(context.dataPath),
    protected streamBalanceDAL = createStreamBalanceDAL(context.dataPath),
    protected processFlowsBuffer: Utils.BufferExec<string>,
    protected parser = new EventParser(),
  ) {
    super(context)

    this.processFlowsBuffer = new Utils.BufferExec<string>(
      this.handleProcessFlows.bind(this),
      10,
      1000 * 30,
    )
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    const { blockchainId: blockchain, account: contract } = config
    const { instanceName } = this.context

    const supplier = initialSupplyAccount[blockchain]
    const accountBalance = await this.erc20BalanceDAL.get([
      blockchain,
      supplier,
    ])

    console.log(
      'Account indexing',
      instanceName,
      blockchain,
      contract,
      supplier,
      accountBalance,
    )

    // @note: Init the initial supply if it is the first it run
    if (!accountBalance) {
      const balance = blockchainTotalSupply[blockchain].toString('hex')
      await this.erc20BalanceDAL.save({
        blockchain,
        account: supplier,
        balance,
      })

      console.log('Init supply', blockchain, supplier, balance)
    }
  }

  async ethereumFilterLog(
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(BlockchainChain.Ethereum, context, entity)
  }

  async avalancheFilterLog(
    context: ParserContext,
    entity: AvalancheParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(BlockchainChain.Avalanche, context, entity)
  }

  async bscFilterLog(
    context: ParserContext,
    entity: BscParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(BlockchainChain.Bsc, context, entity)
  }

  async baseFilterLog(
    context: ParserContext,
    entity: BaseParsedLog,
  ): Promise<boolean> {
    return this.filterEVMLog(BlockchainChain.Base, context, entity)
  }

  // ---

  async ethereumIndexLogs(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(BlockchainChain.Ethereum, context, entities)
  }

  async avalancheIndexLogs(
    context: ParserContext,
    entities: AvalancheParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(BlockchainChain.Avalanche, context, entities)
  }

  async bscIndexLogs(
    context: ParserContext,
    entities: BscParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(BlockchainChain.Bsc, context, entities)
  }

  async baseIndexLogs(
    context: ParserContext,
    entities: BaseParsedLog[],
  ): Promise<void> {
    return this.indexEVMLogs(BlockchainChain.Base, context, entities)
  }

  protected async filterEVMLog(
    blockchainId: BlockchainId,
    context: ParserContext,
    entity: EthereumParsedLog,
  ): Promise<boolean> {
    const eventSignature = entity.parsed?.signature

    console.log(`Filter ${blockchainId} logs`, eventSignature)

    switch (eventSignature) {
      case EventType.Transfer: {
        return true
      }
      case EventType.FlowUpdated: {
        const tokenAddress = entity.parsed?.args[0]
        if (tokenAddress === blockchainTokenContract[blockchainId]) return true
        break
      }
      case EventType.FlowUpdatedExtension: {
        // @note: We are indexing all token events, cause there is no way to filter them by token address
        return true
      }
    }

    return false
  }

  protected async indexEVMLogs(
    blockchainId: BlockchainId,
    context: ParserContext,
    entities: BscParsedLog[],
  ): Promise<void> {
    console.log(`Index ${blockchainId} logs`, JSON.stringify(entities, null, 2))

    const parsedTransferEvents: ERC20TransferEvent[] = []
    const parsedFlowUpdatedEvents: StreamFlowUpdatedEvent[] = []
    const parsedFlowUpdatedExtensionEvents: StreamFlowUpdatedExtensionEvent[] =
      []
    const parsedBalances: ERC20Balance[] = []

    for (const entity of entities) {
      const eventSignature = entity.parsed?.signature

      switch (eventSignature) {
        case EventType.Transfer: {
          const parsedTransferEvent = this.parser.parseERC20TransferEvent(
            blockchainId,
            entity,
          )
          parsedTransferEvents.push(parsedTransferEvent)

          const parsedBalance = this.parser.parseBalance(blockchainId, entity)
          parsedBalances.push(...parsedBalance)

          break
        }
        case EventType.FlowUpdated: {
          const parsedFlowUpdatedEvent =
            this.parser.parseStreamFlowUpdatedEvent(blockchainId, entity)
          parsedFlowUpdatedEvents.push(parsedFlowUpdatedEvent)

          break
        }
        case EventType.FlowUpdatedExtension: {
          const parsedFlowUpdatedExtensionEvent =
            this.parser.parseStreamFlowUpdatedExtensionEvent(
              blockchainId,
              entity,
            )
          parsedFlowUpdatedExtensionEvents.push(parsedFlowUpdatedExtensionEvent)

          break
        }
      }
    }

    if (parsedTransferEvents.length) {
      await this.erc20TransferEventDAL.save(parsedTransferEvents)
    }

    if (parsedBalances.length) {
      await this.erc20BalanceDAL.save(parsedBalances)
    }

    if (parsedFlowUpdatedExtensionEvents.length) {
      await this.streamFlowUpdatedExtensionEventDAL.save(
        parsedFlowUpdatedExtensionEvents,
      )
    }

    console.log('🌈 0', parsedFlowUpdatedEvents.length)

    if (parsedFlowUpdatedEvents.length) {
      await this.streamFlowUpdatedEventDAL.save(parsedFlowUpdatedEvents)

      const updatedAccounts = parsedFlowUpdatedEvents.flatMap((event) => [
        `${event.blockchain}:${event.from}`,
        `${event.blockchain}:${event.to}`,
      ])

      // @note: don't block the indexing, just notify there should be a new calculation
      console.log('🌈 1', updatedAccounts.length)
      this.processFlowsBuffer.add(updatedAccounts).catch(() => 'ignore')
    }
  }

  protected async handleProcessFlows(bcAccounts: string[]): Promise<void> {
    console.log('🌈 2', bcAccounts.length)

    const uniqueAccounts = [...new Set(bcAccounts)]

    console.log('🌈 3', uniqueAccounts, uniqueAccounts.length)
    try {
      for (const bcAccount of uniqueAccounts) {
        const [blockchain, account] = bcAccount.split(':')

        const entries = await this.streamFlowUpdatedEventDAL
          .useIndex(StreamFlowUpdatedEventDALIndex.BlockchainAccountTimestamp)
          .getAllValuesFromTo([blockchain, account], [blockchain, account], {
            reverse: false,
          })

        const lastestStates: Record<
          string,
          {
            staticBalanceBN: BN
            flowRateBN: BN
            timestamp: number
            updates: number
          }
        > = {}

        for await (const e of entries) {
          const id = `${e.from}:${e.to}`

          console.log('✅ 0', id, e.timestamp)

          const lastState = (lastestStates[id] = lastestStates[id] || {
            staticBalanceBN: new BN(0),
            flowRateBN: new BN(0),
            timestamp: 0,
            updates: 0,
          })

          const oldFlowRate = lastState.flowRateBN
          const oldTimestamp = lastState.timestamp
          const elapsedTime = new BN(
            Math.trunc((e.timestamp - oldTimestamp) / 1000),
          )

          const streamedDelta = oldFlowRate.mul(elapsedTime)
          const newStaticBalance = lastState.staticBalanceBN.add(streamedDelta)

          lastState.staticBalanceBN = newStaticBalance
          lastState.flowRateBN =
            account === e.from
              ? (e.flowRateBN as BN).neg()
              : (e.flowRateBN as BN)
          lastState.timestamp = e.timestamp
          lastState.updates++

          // const isCreate = oldFlowRate.isZero()
          // const isDelete = e.flowRateBN.isZero()
        }

        for (const lastState of Object.values(lastestStates)) {
          const streamBalance: StreamBalance = {
            blockchain,
            account,
            staticBalance: bigNumberToString(lastState.staticBalanceBN),
            flowRate: bigNumberToString(lastState.flowRateBN),
            timestamp: lastState.timestamp,
            updates: lastState.updates,
          }

          await this.streamBalanceDAL.save(streamBalance)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  // API methods

  async getTransferEvents(
    account: string,
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    return this.getEvents(
      account,
      args,
      this.erc20TransferEventDAL,
      ERC20TransferEventDALIndex,
    )
  }

  async getFlowUpdatedEvents(
    account: string,
    args: StreamFlowUpdatedEventQueryArgs,
  ): Promise<StreamFlowUpdatedEvent[]> {
    return this.getEvents(
      account,
      args,
      this.streamFlowUpdatedEventDAL,
      StreamFlowUpdatedEventDALIndex,
    )
  }

  protected async getEvents<T extends CommonEvent>(
    account: string,
    args: CommonEventQueryArgs,
    eventDAL: EntityStorage<T>,
    eventIndexes: {
      BlockchainAccountTimestamp: string
      BlockchainAccountHeight: string
      BlockchainTimestamp: string
      BlockchainHeight: string
    },
  ): Promise<T[]> {
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
    const result: T[] = []

    let entries

    if (!entries && acc) {
      if (startDate !== undefined || endDate !== undefined) {
        startDate = startDate !== undefined ? startDate : 0
        endDate = endDate !== undefined ? endDate : Date.now()

        entries = await eventDAL
          .useIndex(eventIndexes.BlockchainAccountTimestamp)
          .getAllValuesFromTo(
            [blockchain, acc, startDate],
            [blockchain, acc, endDate],
            opts,
          )
      } else {
        startHeight = startHeight !== undefined ? startHeight : 0
        endHeight =
          endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

        entries = await eventDAL
          .useIndex(eventIndexes.BlockchainAccountHeight)
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

      entries = await eventDAL
        .useIndex(eventIndexes.BlockchainTimestamp)
        .getAllValuesFromTo(
          [blockchain, startDate],
          [blockchain, endDate],
          opts,
        )
    }

    if (!entries) {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      entries = await eventDAL
        .useIndex(eventIndexes.BlockchainHeight)
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

  // ------------------------

  async getERC20Balances(
    account: string,
    args: CommonBalanceQueryArgs,
  ): Promise<ERC20Balance[]> {
    return this.getCommonBalances(
      account,
      args,
      this.erc20BalanceDAL,
      ERC20BalanceDALIndex,
    )
  }

  async getStreamBalances(
    account: string,
    args: CommonBalanceQueryArgs,
  ): Promise<StreamBalance[]> {
    const balances = await this.getCommonBalances(
      account,
      args,
      this.streamBalanceDAL,
      StreamBalanceDALIndex,
    )

    return balances.map((balance) => {
      const elapsedTime = new BN(
        Math.trunc((Date.now() - balance.timestamp) / 1000),
      )
      const realTimeBalanceBN = (balance.flowRateBN as BN).mul(elapsedTime)
      const balanceBN = (balance.staticBalanceBN as BN).add(realTimeBalanceBN)

      balance.realTimeBalance = bigNumberToString(realTimeBalanceBN)
      balance.realTimeBalanceBN = realTimeBalanceBN
      balance.realTimeBalanceNum = bigNumberToNumber(
        realTimeBalanceBN,
        blockchainDecimals[balance.blockchain],
      )

      balance.balance = bigNumberToString(balanceBN)
      balance.balanceBN = balanceBN
      balance.balanceNum = bigNumberToNumber(
        balanceBN,
        blockchainDecimals[balance.blockchain],
      )

      return balance
    })
  }

  // @note: Improve performance
  async getBalances(
    account: string,
    args: CommonBalanceQueryArgs,
  ): Promise<Balance[]> {
    const { blockchain } = args

    const [erc20Balances, streamBalances] = await Promise.all([
      this.getERC20Balances(account, args),
      this.getStreamBalances(account, args),
    ])

    const erc20BalancesMap = erc20Balances.reduce((ac, cv) => {
      ac[cv.account] = cv
      return ac
    }, {} as Record<string, ERC20Balance>)

    const streamBalancesMap = streamBalances.reduce((ac, cv) => {
      ac[cv.account] = cv
      return ac
    }, {} as Record<string, StreamBalance>)

    const allAccounts = [
      ...new Set([
        ...Object.keys(erc20BalancesMap),
        ...Object.keys(streamBalancesMap),
      ]),
    ]

    return allAccounts.map((account) => {
      const erc20Balance = erc20BalancesMap[account]
      const streamBalance = streamBalancesMap[account]

      const newBalance = (erc20Balance?.balanceBN || new BN(0)).add(
        streamBalance?.balanceBN || new BN(0),
      )

      return {
        blockchain,
        account,
        balance: bigNumberToString(newBalance),
        balanceBN: newBalance,
        balanceNum: bigNumberToNumber(
          newBalance,
          blockchainDecimals[args.blockchain],
        ),
      }
    })
  }

  protected async getCommonBalances<T extends CommonBalance>(
    account: string,
    args: CommonBalanceQueryArgs,
    balanceDAL: EntityStorage<T>,
    balanceIndexes: {
      BlockchainBalance: string
    },
  ): Promise<T[]> {
    let { blockchain, account: acc, ...opts } = args

    console.log('QUERY BALANCE ', account, args)

    opts.reverse = opts.reverse !== undefined ? opts.reverse : true

    let skip = opts.skip || 0
    const limit = opts.limit || 1000
    const result: T[] = []

    let entries

    if (!entries && acc) {
      entries = await balanceDAL.getAllValuesFromTo(
        [blockchain, acc],
        [blockchain, acc],
        opts,
      )
    }

    if (!entries) {
      entries = await balanceDAL
        .useIndex(balanceIndexes.BlockchainBalance)
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
