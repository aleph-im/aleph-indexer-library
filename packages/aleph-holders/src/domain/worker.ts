/* eslint-disable prefer-const */
import {
  IndexerDomainContext,
  IndexerWorkerDomain,
  AccountIndexerConfigWithMeta,
  ParserContext,
  BlockchainChain,
  BlockchainId,
  IndexableEntityType,
} from '@aleph-indexer/framework'
import {
  EthereumLogIndexerWorkerDomainI,
  EthereumParsedLog,
} from '@aleph-indexer/ethereum'
import { BscLogIndexerWorkerDomainI, BscParsedLog } from '@aleph-indexer/bsc'
import {
  SolanaIndexerWorkerDomainI,
  SolanaParsedInstructionContext,
  solanaPrivateRPC,
} from '@aleph-indexer/solana'
import {
  EventType,
  TransferEventQueryArgs,
  TransferEvent,
  BalanceQueryArgs,
  Balance,
  SPLTokenEvent,
} from '../types.js'
import {
  TransferEventDALIndex,
  createTransferEventDAL,
} from '../dal/transfer.js'
import { EthereumEventParser } from './parsers/ethereum.js'
import { BalanceDALIndex, createBalanceDAL } from '../dal/balance.js'
import {
  bigNumberToString,
  blockchainDeployerAccount,
  blockchainTokenContract,
  blockchainTotalSupply,
  stringToHex,
  uint256ToBigNumber,
} from '../utils/index.js'
import { SolanaEventParser } from './parsers/solana.js'
import { TokenAccount, createTokenAccounttDAL } from '../dal/tokenAccount.js'
import {
  IndexTokenAccount,
  createFetchTokenAccountDAL,
} from '../dal/fetchTokenAccount.js'
import { PendingWork, PendingWorkPool } from '@aleph-indexer/core'
import {
  getEventAccounts,
  isSPLTokenInstruction,
  isTokenMovement,
} from '../utils/solana.js'
import { createSolanaEventDAL } from '../dal/solanaEvents.js'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements
    EthereumLogIndexerWorkerDomainI,
    BscLogIndexerWorkerDomainI,
    SolanaIndexerWorkerDomainI
{
  public tokenAccountsCache: string[] = []
  public tokenAccounts: PendingWorkPool<IndexTokenAccount>

  constructor(
    protected context: IndexerDomainContext,
    protected solParser: SolanaEventParser,
    protected transferEventDAL = createTransferEventDAL(context.dataPath),
    protected balanceDAL = createBalanceDAL(context.dataPath),
    protected tokenAccountDAL = createTokenAccounttDAL(context.dataPath),
    protected solanaEventDAL = createSolanaEventDAL(context.dataPath),
    protected fetchTokenAccountDAL = createFetchTokenAccountDAL(
      context.dataPath,
    ),
    protected ethParser = new EthereumEventParser(),
    protected solRpc = solanaPrivateRPC.getConnection(),
  ) {
    super(context)

    this.tokenAccounts = new PendingWorkPool<IndexTokenAccount>({
      id: 'tokenAccounts',
      interval: 0,
      chunkSize: 100,
      concurrency: 1,
      dal: this.fetchTokenAccountDAL,
      handleWork: this._handleMintAccounts.bind(this),
      checkComplete: () => false,
    })

    this.solParser = new SolanaEventParser(
      this.fetchTokenAccountDAL,
      this.tokenAccountDAL,
      this.solanaEventDAL,
      this.tokenAccounts,
    )
  }

  async onNewAccount(
    config: AccountIndexerConfigWithMeta<TokenAccount>,
  ): Promise<void> {
    const { blockchainId: blockchain, account, meta } = config
    const { instanceName } = this.context

    console.log('Account indexing', instanceName, blockchain, account)

    if (!meta) {
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
  ) {
    return isSPLTokenInstruction(entity.instruction)
  }

  async solanaIndexInstructions(
    context: ParserContext,
    entities: SolanaParsedInstructionContext[],
  ) {
    const alephMint = blockchainTokenContract[BlockchainChain.Solana]
    const parsedEvents: SPLTokenEvent[] = []

    for (const entity of entities) {
      const parsedEvent = await this.solParser.parseEvent(
        entity,
        alephMint,
        context.account,
      )
      if (parsedEvent) {
        parsedEvents.push(parsedEvent)
        /*if (parsedIx.type === SPLTokenEventType.CloseAccount) {
          const work = await this.fetchTokenAccountDAL.getFirstValueFromTo(
            [parsedIx.account],
            [parsedIx.account],
            { atomic: true },
          )
          if (work && parsedIx.timestamp >= work.payload.timestamp) {
            await this.tokenAccounts.removeWork(work)
            const options = {
              account: parsedIx.account,
              index: {
                transactions: true,
                content: true,
              },
            }
            await this.context.apiClient
              .useBlockchain(BlockchainChain.Solana)
              .deleteAccount(options)
          }
        }*/
        if (isTokenMovement(parsedEvent.type)) {
          const [from, to] = getEventAccounts(parsedEvent)
          if (to && 'amount' in parsedEvent) {
            const hexValue = stringToHex(parsedEvent.amount)
            await this.balanceDAL.save([
              {
                blockchain: BlockchainChain.Solana,
                account: to,
                balance: hexValue,
              },
              {
                blockchain: BlockchainChain.Solana,
                account: from,
                balance: bigNumberToString(uint256ToBigNumber(hexValue).ineg()),
              },
            ])

            await this.transferEventDAL.save({
              blockchain: BlockchainChain.Solana,
              id: parsedEvent.id,
              timestamp: parsedEvent.timestamp,
              height: parsedEvent.height,
              transaction: parsedEvent.transaction,
              from,
              to,
              value: hexValue,
            })
          }
        }
      }
    }

    console.log(`indexing ${parsedEvents.length} parsed ixs`)

    if (parsedEvents.length > 0) {
      await this.solanaEventDAL.save(parsedEvents)
    }
  }

  protected async _handleMintAccounts(
    works: PendingWork<IndexTokenAccount>[],
  ): Promise<void> {
    console.log(`Token accounts | Start handling ${works.length} accounts`)

    for (const work of works) {
      if (!work) continue
      const account = work.id
      const accountState = await this.context.apiClient
        .useBlockchain(BlockchainChain.Solana)
        .getAccountState({ type: IndexableEntityType.Transaction, account })
      if (accountState) continue

      const options = {
        account,
        meta: {
          address: account,
          type: 'token_account',
        },
        index: {
          transactions: true,
          content: false,
        },
      }

      await this.context.apiClient
        .useBlockchain(BlockchainChain.Solana)
        .indexAccount(options)
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
