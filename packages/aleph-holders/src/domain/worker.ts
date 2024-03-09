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
  SolanaIndexerWorkerDomainI, 
  SolanaParsedInstructionContext, 
  TOKEN_PROGRAM_ID, 
} from '@aleph-indexer/solana'
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
import { EthereumEventParser } from './parsers/ethereum.js'
import { BalanceDALIndex, createBalanceDAL } from '../dal/balance.js'
import {
  blockchainDeployerAccount,
  blockchainTokenContract,
  blockchainTotalSupply,
} from '../utils/index.js'
import { SolanaEventParser } from './parsers/solana.js'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { TokenAccount, createTokenAccounttDAL } from '../dal/tokenAccount.js'
import { createFetchTokenAccountDAL } from '../dal/fetchTokenAccount.js'
import { PendingWork, PendingWorkPool } from '@aleph-indexer/core'

export default class WorkerDomain
  extends IndexerWorkerDomain
  implements EthereumLogIndexerWorkerDomainI, BscLogIndexerWorkerDomainI, SolanaIndexerWorkerDomainI
{
  protected tokenAccountsCache: string[] = []
  protected tokenAccounts: PendingWorkPool<TokenAccount>

  constructor(
    protected context: IndexerDomainContext,
    protected transferEventDAL = createTransferEventDAL(
      context.dataPath,
    ),
    protected balanceDAL = createBalanceDAL(context.dataPath),
    protected tokenAccountDAL = createTokenAccounttDAL(context.dataPath),
    protected fetchTokenAccountDAL = createFetchTokenAccountDAL(context.dataPath),
    protected ethParser = new EthereumEventParser(),
    protected solParser = new SolanaEventParser(),
    //protected solRpc = solanaPrivateRPC.getConnection(),
  ) {
    super(context)

    this.tokenAccounts = new PendingWorkPool<TokenAccount>({
      id: 'tokenAccounts',
      interval: 0,
      chunkSize: 100,
      concurrency: 1,
      dal: this.fetchTokenAccountDAL,
      handleWork: this._handleTokenAccounts.bind(this),
      checkComplete: () => true,
    })
  }

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    const { blockchainId: blockchain, account } = config
    const { instanceName } = this.context

    const deployer = blockchainDeployerAccount[blockchain]
    const accountBalance = await this.balanceDAL.get([blockchain, deployer])

    console.log(
      'Account indexing',
      instanceName,
      blockchain,
      account,
      deployer,
      accountBalance,
    )

    // @note: Init the initial supply if it is the first it run
    if (!accountBalance && deployer) {
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

  async solanaFilterInstruction(context: ParserContext, entity: SolanaParsedInstructionContext) {
    const ix = entity.instruction as any
    if (!ix.parsed) return false
    
    const alephMint = blockchainTokenContract[BlockchainChain.Solana]
    const isNewAccount = await this.isNewAccount(ix.parsed, alephMint)
    if (isNewAccount) return false
  
    const id = `${entity.parentTransaction.signature}${
      entity.parentInstruction ? `:${entity.parentInstruction.index.toString().padStart(2, '0')}` : ''
    }:${ix.index.toString().padStart(2, '0')}`
  
    const isProcessed = await this.transferEventDAL.get(id)
    if (isProcessed) return false
  
    const isTokenMovement = [
      SPLTokenEventType.Transfer,
      SPLTokenEventType.TransferChecked,
      SPLTokenEventType.MintTo,
      SPLTokenEventType.MintToChecked,
      SPLTokenEventType.Burn,
      SPLTokenEventType.BurnChecked,
    ].includes(ix.parsed.type) && ix.programId === TOKEN_PROGRAM_ID
    if (!isTokenMovement) return false
    
    return this.validateTokenMovement(ix.parsed.info, alephMint)
  }  

  async isNewAccount(parsed: any, alephMint: string) {
    const isNewAccountEvent = [
      SPLTokenEventType.InitializeAccount,
      SPLTokenEventType.InitializeAccount2,
      SPLTokenEventType.InitializeAccount3,
    ].includes(parsed.type)
    if (!isNewAccountEvent) return false

    if (!this.tokenAccountsCache.includes(parsed.info.account) 
    && parsed.info.mint === alephMint) {
      this.tokenAccountsCache.push(parsed.info.account)

      this.tokenAccounts.addWork({
        id: parsed.info.account,
        time: Date.now(),
        payload: {
          address: parsed.info.account,
          owner: parsed.info.owner,
          mint: alephMint,
        },
      })
      /*const options = {
        blockchainId: BlockchainChain.Solana,
        account: parsed.info.account,
        index: { transactions: true },
      }
      await this.context.apiClient
        .useBlockchain(BlockchainChain.Solana)
        .indexAccount(options)*/

      return true
    }
    return false
  }

  protected async _handleTokenAccounts(
    works: PendingWork<TokenAccount>[],
  ): Promise<void> {
    console.log(
      `Mint accounts | Start handling ${works.length} minted accounts`,
    )

    for (const work of works) {
      if (!work) continue

      const account = work.id
      if (!this.tokenAccountsCache.includes(account)) continue
      
      const options = {
        account,
        meta: {
          address: account,
          type: 'token_account',
          mint: work.payload.mint,
        },
        index: {
          transactions: {
            chunkDelay: 0,
            chunkTimeframe: 1000 * 60 * 60 * 24,
          },
          content: false,
        },
      }
      await this.context.apiClient
        .useBlockchain(BlockchainChain.Solana)
        .indexAccount(options)
    }
  }

  /*isValidTransafer(info: any): info is SPLTokenRawInfoTransfer {
    return typeof info.amount === 'string' &&
      typeof info.destination === 'string' &&
      typeof info.source === 'string' && (
        typeof info.authority === 'string' || 
        typeof info.multisigAuthority === 'string'
      )
  }*/

  validateTokenMovement(info: any, alephMint: string) {
    if (info.mint) {
      return info.mint === alephMint
    } else {
      const owner = new PublicKey(info.authority || info.multisigAuthority)
    
      // idk why FTX ata can not be derived
      const FTX_ATA = '341LwarVojT1g5xMgrRYLuQ4G5oxXMSH3uEe88zu1jZ4'
      if ([info.source, info.destination].includes(FTX_ATA)) return true
      
      const expectedAta = getAssociatedTokenAddressSync(new PublicKey(alephMint), owner, true)
      return expectedAta.toString() === info.source
    }
  }

  /*private async validateAtaFromInfo(alephPubkey: PublicKey, accounts: string[]): Promise<boolean> {
    for (const account of accounts) {
      const accountInfo = await this.solRpc.getAccountInfo(new PublicKey(account))
      if (accountInfo?.data) {
        const tokenAccountInfo = AccountLayout.decode(accountInfo.data)
        if (tokenAccountInfo.mint.equals(alephPubkey)) {
          console.log('validated ata')
          return true
        }
      }
    }
    console.log('ata not validated')
    return false
  }*/

  async solanaIndexInstructions(
    context: ParserContext,
    ixsContext: SolanaParsedInstructionContext[],
  ): Promise<void> {
    const { parsedEvents, parsedBalances } = this.solParser.parse(ixsContext)

    console.log(`indexing ${parsedEvents.length} parsed events from ${ixsContext.length} parsed ixs`)

    if (parsedEvents.length) {
      await this.transferEventDAL.save(parsedEvents)
    }

    if (parsedBalances.length) {
      await this.balanceDAL.save(parsedBalances)
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
