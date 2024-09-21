/* eslint-disable prefer-const */
import BN from 'bn.js'
import {
  IndexerDomainContext,
  AccountIndexerRequestArgs,
  ParserContext,
} from '@aleph-indexer/framework'
import { EntityStorage, Utils } from '@aleph-indexer/core'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import {
  EventSignature,
  ERC20TransferEventQueryArgs,
  ERC20TransferEvent,
  ERC20Balance,
  StreamFlowUpdatedEvent,
  StreamFlowUpdatedEventQueryArgs,
  StreamFlowUpdatedExtensionEvent,
  StreamBalance,
  StreamFlowUpdatedExtensionEventQueryArgs,
  EVMEventType,
} from '../../types/evm.js'
import {
  ERC20TransferEventDALIndex,
  createERC20TransferEventDAL,
} from '../../dal/evm/erc20TransferEvent.js'
import { EVMEventParser } from '../parser/evm.js'
import {
  ERC20BalanceDALIndex,
  createERC20BalanceDAL,
} from '../../dal/evm/erc20Balance.js'
import {
  initialSupplyAccount,
  blockchainTotalSupply,
  blockchainTokenContract,
  bigNumberToUint256,
  bigNumberToInt96,
  getBNFormats,
  getStreamRealTimeBalance,
  getStreamTotalBalance,
} from '../../utils/index.js'
import {
  StreamFlowUpdatedEventDALIndex,
  createStreamFlowUpdatedEventDAL,
} from '../../dal/evm/streamFlowUpdatedEvent.js'
import {
  StreamFlowUpdatedExtensionEventDALIndex,
  createStreamFlowUpdatedExtensionEventDAL,
} from '../../dal/evm/streamFlowUpdatedExtensionEvent.js'
import {
  StreamBalanceDALIndex,
  createStreamBalanceDAL,
} from '../../dal/evm/streamBalance.js'
import {
  Balance,
  BlockchainWorkerI,
  CommonBalanceQueryArgs,
  CommonEvent,
  CommonEventQueryArgs,
} from '../../types/common.js'
import { getCommonBalances, getCommonEvents } from '../../utils/query.js'

export default class EVMWorkerDomain implements BlockchainWorkerI {
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
    protected parser = new EVMEventParser(),
  ) {
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

    switch (eventSignature) {
      case EventSignature.Transfer: {
        return true
      }
      case EventSignature.FlowUpdated: {
        const tokenAddress = entity.parsed?.args[0]
        if (tokenAddress === blockchainTokenContract[blockchainId]) return true
        break
      }
      case EventSignature.FlowUpdatedExtension: {
        // @note: We are indexing all token events, cause there is no way to filter them by token address
        return true
      }
    }

    return false
  }

  async indexEntities(
    context: ParserContext,
    entities: EthereumParsedLog[],
  ): Promise<void> {
    const { blockchainId } = context
    console.log(`Index ${blockchainId} logs`, JSON.stringify(entities, null, 2))

    const parsedTransferEvents: ERC20TransferEvent[] = []
    const parsedFlowUpdatedEvents: StreamFlowUpdatedEvent[] = []
    const parsedFlowUpdatedExtensionEvents: StreamFlowUpdatedExtensionEvent[] =
      []
    const parsedBalances: ERC20Balance[] = []
    const updatedAccountsToCalculateStreamBalance: string[] = []

    // @note: Parsing events

    for (const entity of entities) {
      const parsedEvent = this.parser.parseEvent(blockchainId, entity)
      if (!parsedEvent) continue

      switch (parsedEvent.type) {
        case EVMEventType.Transfer: {
          parsedTransferEvents.push(parsedEvent)

          const parsedBalance = this.parser.parseBalanceFromEvent(parsedEvent)
          parsedBalances.push(...parsedBalance)

          break
        }
        case EVMEventType.FlowUpdated: {
          parsedFlowUpdatedEvents.push(parsedEvent)

          const { blockchain, from, to } = parsedEvent
          updatedAccountsToCalculateStreamBalance.push(
            `${blockchain}:${from}`,
            `${blockchain}:${to}`,
          )

          break
        }
        case EVMEventType.FlowUpdatedExtension: {
          parsedFlowUpdatedExtensionEvents.push(parsedEvent)

          const { blockchain, flowOperator } = parsedEvent
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

  // -------------------------

  async getTransferEvents(
    args: ERC20TransferEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    return getCommonEvents(
      args,
      this.erc20TransferEventDAL,
      ERC20TransferEventDALIndex,
    )
  }

  async getFlowUpdatedEvents(
    args: StreamFlowUpdatedEventQueryArgs,
  ): Promise<StreamFlowUpdatedEvent[]> {
    return getCommonEvents(
      args,
      this.streamFlowUpdatedEventDAL,
      StreamFlowUpdatedEventDALIndex,
    )
  }

  async getFlowUpdatedExtensionEvents(
    args: StreamFlowUpdatedExtensionEventQueryArgs,
  ): Promise<StreamFlowUpdatedExtensionEvent[]> {
    return getCommonEvents(
      args,
      this.streamFlowUpdatedExtensionEventDAL,
      StreamFlowUpdatedExtensionEventDALIndex,
    )
  }

  async getERC20Balances(
    args: CommonBalanceQueryArgs,
  ): Promise<ERC20Balance[]> {
    return getCommonBalances(args, this.erc20BalanceDAL, ERC20BalanceDALIndex)
  }

  async getStreamBalances(
    args: CommonBalanceQueryArgs,
  ): Promise<StreamBalance[]> {
    const balances = await getCommonBalances(
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
  async getBalances(args: CommonBalanceQueryArgs): Promise<Balance[]> {
    const { blockchain } = args
    const reverse = args.reverse !== undefined ? args.reverse : true

    const [erc20Balances, streamBalances] = await Promise.all([
      this.getERC20Balances(args),
      this.getStreamBalances(args),
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
      const newBalanceBN = prevBalanceBN.add(currBalanceBN)

      const b = getBNFormats(newBalanceBN, args.blockchain)
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
        const newBalanceBN = erc20BalanceBN.add(streamBalanceBN)

        const b = getBNFormats(newBalanceBN, args.blockchain)

        return {
          blockchain,
          account,
          balance: b.value,
          balanceBN: b.valueBN,
          balanceNum: b.valueNum,
        }
      })
      .filter(({ balanceBN }) => !balanceBN.isZero())
      .sort(
        ({ balanceBN: a }, { balanceBN: b }) =>
          (reverse ? -1 : 1) * (a.lt(b) ? -1 : a.gt(b) ? 1 : 0),
      )
  }

  // --------------------------------

  protected getFlowUpdatedExtensionId(event: StreamFlowUpdatedEvent): string {
    // @note: FlowUpdated event looks like "base_19025563_0x19ba78b9cdb05a877718841c574325fdb53601bb_231"
    // @note: FlowUpdatedExtension is always the next log index in the same transaction, so it would be: "base_19025563_0x19ba78b9cdb05a877718841c574325fdb53601bb_232"
    const [blockchain, blockNumber, account, logIndex] = event.id.split('_')

    return `${blockchain}_${blockNumber}_${account}_${Number(logIndex) + 1}`
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
          const streamedDelta = getStreamRealTimeBalance(
            flowRateBN,
            timestamp,
            e.timestamp,
          )
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
              (state.event.from === account
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
