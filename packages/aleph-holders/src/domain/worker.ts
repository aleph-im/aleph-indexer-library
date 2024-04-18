/* eslint-disable prefer-const */
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  ParserContext,
  BlockchainChain,
  BlockchainId,
  AccountIndexerRequestArgs,
} from '@aleph-indexer/framework'
import {
  EthereumLogIndexerWorkerDomainI,
  EthereumParsedLog,
} from '@aleph-indexer/ethereum'
import { 
  BscLogIndexerWorkerDomainI, 
  BscParsedLog 
} from '@aleph-indexer/bsc'
import {
  EventType,
  TransferEventQueryArgs,
  TransferEvent,
  BalanceQueryArgs,
  Balance,
  SPLTokenEventType,
} from '../types.js'
import {
  TransferEventDALIndex,
  createTransferEventDAL,
} from '../dal/transfer.js'
import { EthereumEventParser } from './parser/ethereum.js'
import { BalanceDALIndex, createBalanceDAL } from '../dal/balance.js'
import {
  bigNumberToString,
  blockchainDecimals,
  blockchainDeployerAccount,
  blockchainTokenContract,
  blockchainTotalSupply,
  uint256ToBigNumber,
  uint256ToNumber,
} from '../utils/index.js'
import { SolanaIndexerWorkerDomainI, SolanaParsedInstructionContext } from '@aleph-indexer/solana'
import { 
  isSPLTokenInstruction, 
  isInitInstruction, 
  isMovementWithMint, 
  validateExpectedAta, 
  solanaSnapshot, 
  getEventBase 
} from '../utils/solana.js'
import { SolanaEventParser } from './parser/solana.js'
import { createTokenAccounttDAL } from '../dal/tokenAccount.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements
    EthereumLogIndexerWorkerDomainI,
    BscLogIndexerWorkerDomainI,
    SolanaIndexerWorkerDomainI {

  // used as reference to process events from on Solana
  protected snapshotTimestamp = Date.now()

  constructor(
    protected context: IndexerDomainContext,
    protected ethParser = new EthereumEventParser(),
    protected solParser = new SolanaEventParser(),
    protected transferEventDAL = createTransferEventDAL(context.dataPath),
    protected balanceDAL = createBalanceDAL(context.dataPath),
    protected tokenAccountDAL = createTokenAccounttDAL(context.dataPath),
  ) {
    super(context)
  }

  async init(): Promise<void> {
    await super.init()

    const balances: Balance[] = []
    const accounts = await solanaSnapshot()
    this.snapshotTimestamp = Date.now()
    await this.tokenAccountDAL.save(accounts)

    for (const account of accounts) {
      balances.push({
        blockchain: BlockchainChain.Solana,
        account: account.owner,
        balance: account.balance,
        balanceBN: uint256ToBigNumber(account.balance),
        balanceNum: uint256ToNumber(
          account.balance,
          blockchainDecimals[BlockchainChain.Solana],
        )
      })

      await this.context.apiClient
        .useBlockchain(BlockchainChain.Solana)
        .indexAccount({
          account: account.address,
          index: { transactions: true },
        })
    }

    await this.balanceDAL.save(balances)
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    const { blockchainId: blockchain, account } = config
    const { instanceName } = this.context

    console.log('Account indexing', instanceName, blockchain, account)

    if (Object.values(blockchainTokenContract).includes(account)) {
      // @note: Init the initial supply if it is the first run
      const deployer = blockchainDeployerAccount[blockchain]
      const accountBalance = await this.balanceDAL.get([blockchain, deployer])
      if (!accountBalance) {
        const balance = blockchainTotalSupply[blockchain].toString('hex')
        await this.balanceDAL.save({ blockchain, account: deployer, balance })

        console.log('Init supply', blockchain, deployer, balance)
      }
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

    const parsedEvents: TransferEvent[] = []
    const parsedBalances: Balance[] = []

    for (const entity of entities) {
      const parsedEvent = this.ethParser.parseERC20TransferEvent(
        blockchainId,
        entity,
      )
      parsedEvents.push(parsedEvent)

      const parsedBalance = this.ethParser.parseBalance(blockchainId, entity)
      parsedBalances.push(...parsedBalance)
    }

    if (parsedEvents.length) {
      await this.transferEventDAL.save(parsedEvents)
    }

    if (parsedBalances.length) {
      await this.balanceDAL.save(parsedBalances)
    }
  }

  async solanaFilterInstruction(
    context: ParserContext,
    entity: SolanaParsedInstructionContext,
  ): Promise<boolean> {
    if (!isSPLTokenInstruction(entity.instruction)) return false

    const { id, timestamp } = getEventBase(entity)
    const eventProcessed = await this.transferEventDAL.get(id)
    if (eventProcessed) return false
    // only process events after the snapshot
    if (timestamp < this.snapshotTimestamp) return false

    console.log('New event', entity)
    const alephMint = blockchainTokenContract[BlockchainChain.Solana]
    const parsed = entity.instruction.parsed as any

    if (isInitInstruction(parsed, alephMint)) {
      console.log('Indexed account', parsed.info.account)

      await this.context.apiClient
        .useBlockchain(BlockchainChain.Solana)
        .indexAccount({
          account: parsed.info.account,
          index: { transactions: true },
        })

      return false
    }

    if (parsed.type === SPLTokenEventType.CloseAccount) {
      const exists = await this.tokenAccountDAL.get(parsed.info.account)
      if (!exists) return false

      console.log('Deleted account', parsed.info.account)
      await this.context.apiClient
        .useBlockchain(BlockchainChain.Solana)
        .deleteAccount({
          account: parsed.info.account,
          index: { transactions: true },
        })

      return false
    }

    return await this.isMovementInstruction(parsed, alephMint)
  }
    
  protected async isMovementInstruction(
    parsed: any,
    alephMint: string,
  ): Promise<boolean> {
    if (isMovementWithMint(parsed, alephMint)) return true
    if (parsed.type !== SPLTokenEventType.Transfer) return false

    const accounts = [parsed.info.source, parsed.info.destination]
    for (const account of accounts) {
      const exists = await this.tokenAccountDAL.get(account)
      if (exists) return true
    }

    const expectedAtaValidation = validateExpectedAta(parsed, alephMint)
    if (expectedAtaValidation) return true
    
    return false
  }
  
  async solanaIndexInstructions(
    context: ParserContext,
    entities: SolanaParsedInstructionContext[],
  ) {
    console.log(`indexing ${entities.length} parsed ixs`)

    for (const entity of entities) {
      const event = this.solParser.parseEvent(entity)

      const from = await this.tokenAccountDAL.get(event.from)
      const to = await this.tokenAccountDAL.get(event.to)
  
      if (!from || !to) continue
      const value = parseInt(event.amount, 10).toString(16)
      const valueBN = uint256ToBigNumber(value)
  
      const balances: Balance[] = [{
        blockchain: BlockchainChain.Solana,
        account: from.owner,
        balance: bigNumberToString(valueBN.ineg()),
      }, {
        blockchain: BlockchainChain.Solana,
        account: to.owner,
        balance: value,
      }]
  
      const transfer: TransferEvent = {
        blockchain: BlockchainChain.Solana,
        id: event.id,
        timestamp: event.timestamp,
        height: event.height,
        transaction: event.transaction,
        from: from.owner,
        to: to.owner,
        value,
      }
  
      await this.balanceDAL.save(balances)
      await this.transferEventDAL.save(transfer)
    }
  }

  // API methods

  protected async getEvents(
    account: string,
    args: TransferEventQueryArgs,
  ): Promise<TransferEvent[]> {
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
    const result: TransferEvent[] = []

    let entries

    if (!entries && acc) {
      if (startDate !== undefined || endDate !== undefined) {
        startDate = startDate !== undefined ? startDate : 0
        endDate = endDate !== undefined ? endDate : Date.now()

        entries = await this.transferEventDAL
          .useIndex(TransferEventDALIndex.BlockchainAccountTimestamp)
          .getAllValuesFromTo(
            [blockchain, acc, startDate],
            [blockchain, acc, endDate],
            opts,
          )
      } else {
        startHeight = startHeight !== undefined ? startHeight : 0
        endHeight =
          endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

        entries = await this.transferEventDAL
          .useIndex(TransferEventDALIndex.BlockchainAccountHeight)
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

      entries = await this.transferEventDAL
        .useIndex(TransferEventDALIndex.BlockchainTimestamp)
        .getAllValuesFromTo(
          [blockchain, startDate],
          [blockchain, endDate],
          opts,
        )
    }

    if (!entries) {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      entries = await this.transferEventDAL
        .useIndex(TransferEventDALIndex.BlockchainHeight)
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
