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
  StreamFlowUpdatedExtensionEventQueryArgs,
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
  bigNumberToUint256,
  bigNumberToInt96,
  getBNFormats,
  getStreamRealTimeBalance,
  getStreamTotalBalance,
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
import {
  StreamFlowUpdatedExtensionEventDALIndex,
  createStreamFlowUpdatedExtensionEventDAL,
} from '../dal/streamFlowUpdatedExtensionEvent.js'
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
    const { blockchainId: blockchain, account } = config

    const tokenContractAccount = this.context.apiClient
      .useBlockchain(blockchain)
      .normalizeAccount(blockchainTokenContract[blockchain])

    // @note: base and avalanche are tracking multiple accounts
    // only update initial supply if the account is the token contract
    if (tokenContractAccount !== account) return

    const { instanceName } = this.context
    const supplier = initialSupplyAccount[blockchain]

    // @note: Check if there is at leasst one transfer before overriding the
    // balance with the initial supply
    const supplierLastTransfer = await this.erc20TransferEventDAL
      .useIndex(ERC20TransferEventDALIndex.BlockchainAccountTimestamp)
      .getLastValueFromTo([blockchain, supplier], [blockchain, supplier])

    console.log(
      'Account indexing',
      instanceName,
      blockchain,
      account,
      supplier,
      supplierLastTransfer,
    )

    // @note: Init the initial supply if it is the first run (no transfers yet)
    if (!supplierLastTransfer) {
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

  // API methods

  async getTransferEvents(
    account: string,
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    return this.getCommonEvents(
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
    return this.getCommonEvents(
      account,
      args,
      this.streamFlowUpdatedEventDAL,
      StreamFlowUpdatedEventDALIndex,
    )
  }

  async getFlowUpdatedExtensionEvents(
    account: string,
    args: StreamFlowUpdatedExtensionEventQueryArgs,
  ): Promise<StreamFlowUpdatedExtensionEvent[]> {
    return this.getCommonEvents(
      account,
      args,
      this.streamFlowUpdatedExtensionEventDAL,
      StreamFlowUpdatedExtensionEventDALIndex,
    )
  }

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
      const { timestamp } = balance
      const staticBalanceBN = balance.staticBalanceBN as BN
      const depositBN = balance.depositBN as BN
      const flowRateBN = balance.flowRateBN as BN

      const realTimeBalanceBN = getStreamRealTimeBalance(flowRateBN, timestamp)
      const balanceBN = getStreamTotalBalance(
        depositBN,
        staticBalanceBN,
        realTimeBalanceBN,
      )

      const rtb = getBNFormats(realTimeBalanceBN, balance.blockchain)
      balance.realTimeBalance = rtb.value
      balance.realTimeBalanceBN = rtb.valueBN
      balance.realTimeBalanceNum = rtb.valueNum

      const b = getBNFormats(balanceBN, balance.blockchain)
      balance.balance = b.value
      balance.balanceBN = b.valueBN
      balance.balanceNum = b.valueNum

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
      const prevBalance = ac[cv.account]

      if (!prevBalance) {
        ac[cv.account] = cv
        return ac
      }

      const prevBalanceBN = prevBalance?.balanceBN || new BN(0)
      const currBalanceBN = cv?.balanceBN || new BN(0)
      const newBalance = prevBalanceBN.add(currBalanceBN)

      const b = getBNFormats(newBalance, args.blockchain)
      prevBalance.balance = b.value
      prevBalance.balanceBN = b.valueBN
      prevBalance.balanceNum = b.valueNum

      return ac
    }, {} as Record<string, StreamBalance>)

    const allAccounts = [
      ...new Set([
        ...Object.keys(erc20BalancesMap),
        ...Object.keys(streamBalancesMap),
      ]),
    ]

    return allAccounts
      .map((account) => {
        const erc20Balance = erc20BalancesMap[account]
        const streamBalance = streamBalancesMap[account]

        const erc20BalanceBN = erc20Balance?.balanceBN || new BN(0)
        const streamBalanceBN = streamBalance?.balanceBN || new BN(0)
        const newBalance = erc20BalanceBN.add(streamBalanceBN)

        const b = getBNFormats(newBalance, args.blockchain)

        return {
          blockchain,
          account,
          balance: b.value,
          balanceBN: b.valueBN,
          balanceNum: b.valueNum,
        }
      })
      .filter(({ balanceBN }) => !balanceBN.isZero())
      .sort(({ balanceBN: a }, { balanceBN: b }) =>
        a.lt(b) ? -1 : a.gt(b) ? 1 : 0,
      )
  }

  protected async getCommonEvents<T extends CommonEvent>(
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

  protected async getCommonBalances<T extends CommonBalance>(
    account: string,
    args: CommonBalanceQueryArgs,
    balanceDAL: EntityStorage<T>,
    balanceIndexes: {
      BlockchainAccount: string
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
      entries = await balanceDAL
        .useIndex(balanceIndexes.BlockchainAccount)
        .getAllValuesFromTo([blockchain, acc], [blockchain, acc], opts)
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

  // --------------------------------

  protected getFlowUpdatedExtensionId(event: StreamFlowUpdatedEvent): string {
    // @note: FlowUpdated event looks like "base_19025563_0x19ba78b9cdb05a877718841c574325fdb53601bb_231"
    // @note: FlowUpdatedExtension is always the next log index in the same transaction, so it would be: "base_19025563_0x19ba78b9cdb05a877718841c574325fdb53601bb_232"
    const [blockchain, blockNumber, account, logIndex] = event.id.split('_')

    return `${blockchain}_${blockNumber}_${account}_${Number(logIndex) + 1}`
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
    const updatedAccountsToCalculateStreamBalance: string[] = []

    // @note: Parsing events

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

          const { blockchain, from, to } = parsedFlowUpdatedEvent
          updatedAccountsToCalculateStreamBalance.push(
            `${blockchain}:${from}`,
            `${blockchain}:${to}`,
          )

          break
        }
        case EventType.FlowUpdatedExtension: {
          const parsedFlowUpdatedExtensionEvent =
            this.parser.parseStreamFlowUpdatedExtensionEvent(
              blockchainId,
              entity,
            )
          parsedFlowUpdatedExtensionEvents.push(parsedFlowUpdatedExtensionEvent)

          const { blockchain, flowOperator } = parsedFlowUpdatedExtensionEvent
          updatedAccountsToCalculateStreamBalance.push(
            `${blockchain}:${flowOperator}`,
          )

          break
        }
      }
    }

    // @note: Store erc20 transfer events and balances (balance calculation is done on the DAL hook)

    if (parsedTransferEvents.length) {
      await this.erc20TransferEventDAL.save(parsedTransferEvents)
    }

    if (parsedBalances.length) {
      await this.erc20BalanceDAL.save(parsedBalances)
    }

    // @note: Store superfluid stream events and balances (balance calculation is in a batch process an overrided each time)

    if (parsedFlowUpdatedEvents.length) {
      await this.streamFlowUpdatedEventDAL.save(parsedFlowUpdatedEvents)
    }

    if (parsedFlowUpdatedExtensionEvents.length) {
      await this.streamFlowUpdatedExtensionEventDAL.save(
        parsedFlowUpdatedExtensionEvents,
      )
    }

    if (updatedAccountsToCalculateStreamBalance.length) {
      // @note: don't block the indexing, just notify there should be a new calculation
      this.processFlowsBuffer
        .add(updatedAccountsToCalculateStreamBalance)
        .catch(() => 'ignore')
    }
  }

  protected async handleProcessFlows(bcAccounts: string[]): Promise<void> {
    const uniqueAccounts = [...new Set(bcAccounts)]

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
            id: string
            staticBalanceBN: BN
            flowRateBN: BN
            timestamp: number
            updates: number
            event: StreamFlowUpdatedEvent
          }
        > = {}

        for await (const e of entries) {
          const id = `${e.from}:${e.to}`

          const lastState = (lastestStates[id] = lastestStates[id] || {
            id,
            staticBalanceBN: new BN(0),
            flowRateBN: new BN(0),
            timestamp: 0,
            updates: 0,
            event: e,
          })

          const { flowRateBN, timestamp } = lastState
          const streamedDelta = getStreamRealTimeBalance(flowRateBN, timestamp)
          const newStaticBalance = lastState.staticBalanceBN.add(streamedDelta)

          const newFlowRate =
            account === e.from
              ? (e.flowRateBN as BN).neg()
              : (e.flowRateBN as BN)

          lastState.staticBalanceBN = newStaticBalance
          lastState.flowRateBN = newFlowRate
          lastState.timestamp = e.timestamp
          lastState.updates++
          lastState.event = e

          // const isCreate = oldFlowRate.isZero()
          // const isDelete = e.flowRateBN.isZero()
        }

        const saveEntities = await Promise.all(
          Object.values(lastestStates).map(async (state) => {
            const extensionId = this.getFlowUpdatedExtensionId(state.event)

            const lastExtension =
              await this.streamFlowUpdatedExtensionEventDAL.get(extensionId)

            const depositBN =
              (lastExtension?.flowOperator === account
                ? lastExtension?.depositBN
                : undefined) || new BN(0)

            const streamBalance: StreamBalance = {
              id: state.id,
              blockchain,
              account,
              staticBalance: bigNumberToUint256(state.staticBalanceBN),
              flowRate: bigNumberToInt96(state.flowRateBN),
              deposit: bigNumberToUint256(depositBN),
              timestamp: state.timestamp,
              updates: state.updates,
            }

            return streamBalance
          }),
        )

        await this.streamBalanceDAL.save(saveEntities)
      }
    } catch (e) {
      console.log(e)
    }
  }
}
