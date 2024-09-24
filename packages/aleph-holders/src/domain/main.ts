import { BlockchainChain } from '@aleph-indexer/framework'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  ERC20TransferEvent,
  StreamFlowUpdatedEvent,
  StreamBalance,
  StreamFlowUpdatedExtensionEvent,
  ERC20Balance,
} from '../types/evm.js'
import { CommonBalance, CommonEvent } from '../types/common.js'
import {
  blockchainSuperfluidCFAContract,
  blockchainTokenContract,
} from '../utils/index.js'
import fs, { CopyOptions } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { SPLTokenAccountMeta, SPLTokenAccountType } from '../types/solana.js'
import {
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
} from '../types/common.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    // -----------------------------

    await this.ensureParserAbis()

    // -----------------------------

    const { supportedBlockchains } = this.context

    await this.indexAccounts([
      ...(supportedBlockchains.includes(BlockchainChain.Avalanche)
        ? [
            {
              blockchainId: BlockchainChain.Avalanche,
              account: blockchainTokenContract[BlockchainChain.Avalanche],
              index: { logs: true },
            },
            {
              blockchainId: BlockchainChain.Avalanche,
              account:
                blockchainSuperfluidCFAContract[BlockchainChain.Avalanche],
              index: { logs: true },
            },
          ]
        : []),
      ...(supportedBlockchains.includes(BlockchainChain.Base)
        ? [
            {
              blockchainId: BlockchainChain.Base,
              account: blockchainTokenContract[BlockchainChain.Base],
              index: { logs: true },
            },
            {
              blockchainId: BlockchainChain.Base,
              account: blockchainSuperfluidCFAContract[BlockchainChain.Base],
              index: { logs: true },
            },
          ]
        : []),
      ...(supportedBlockchains.includes(BlockchainChain.Ethereum)
        ? [
            {
              blockchainId: BlockchainChain.Ethereum,
              account: blockchainTokenContract[BlockchainChain.Ethereum],
              index: { logs: true },
            },
          ]
        : []),
      ...(supportedBlockchains.includes(BlockchainChain.Bsc)
        ? [
            {
              blockchainId: BlockchainChain.Bsc,
              account: blockchainTokenContract[BlockchainChain.Bsc],
              index: { logs: true },
            },
          ]
        : []),
      ...(supportedBlockchains.includes(BlockchainChain.Solana)
        ? [
            {
              blockchainId: BlockchainChain.Solana,
              account: blockchainTokenContract[BlockchainChain.Solana],
              index: { transactions: true },
              meta: { type: SPLTokenAccountType.Mint } as SPLTokenAccountMeta,
            },
          ]
        : []),
    ])
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<CommonBalance[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getBalances',
        args: [args],
      })

    return response as CommonBalance[]
  }

  async getEvents(args: CommonEventQueryArgs): Promise<CommonEvent[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getEvents',
        args: [args],
      })

    return response as CommonEvent[]
  }

  // ------------------- DEBUG METHODS --------------

  async getTransferEvents(
    args: CommonEventQueryArgs,
  ): Promise<ERC20TransferEvent[]> {
    const { blockchain } = args
    const alephTokenCotract = blockchainTokenContract[blockchain]

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenCotract,
        method: 'getTransferEvents',
        args: [args],
      })

    return response as ERC20TransferEvent[]
  }

  async getFlowUpdatedEvents(
    args: CommonEventQueryArgs,
  ): Promise<StreamFlowUpdatedEvent[]> {
    const { blockchain } = args
    const superfluidCFACotract = blockchainSuperfluidCFAContract[blockchain]

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: superfluidCFACotract,
        method: 'getFlowUpdatedEvents',
        args: [args],
      })

    return response as StreamFlowUpdatedEvent[]
  }

  async getFlowUpdatedExtensionEvents(
    args: CommonEventQueryArgs,
  ): Promise<StreamFlowUpdatedExtensionEvent[]> {
    const { blockchain } = args
    const superfluidCFACotract = blockchainSuperfluidCFAContract[blockchain]

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: superfluidCFACotract,
        method: 'getFlowUpdatedExtensionEvents',
        args: [args],
      })

    return response as StreamFlowUpdatedExtensionEvent[]
  }

  async getERC20Balances(
    args: CommonBalanceQueryArgs,
  ): Promise<ERC20Balance[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getERC20Balances',
        args: [args],
      })

    return response as ERC20Balance[]
  }

  async getStreamBalances(
    args: CommonBalanceQueryArgs,
  ): Promise<StreamBalance[]> {
    const { blockchain } = args
    const superfluidCFACotract = blockchainSuperfluidCFAContract[blockchain]

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: superfluidCFACotract,
        method: 'getStreamBalances',
        args: [args],
      })

    return response as StreamBalance[]
  }

  // @note: Quick fix to copy abis to the parser dir (needed until we detect proxy contracts to forward the address to get the destination contract abi)
  protected async ensureParserAbis(): Promise<void> {
    const fsCopy = promisify<string, string, CopyOptions>(fs.cp)

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const { dataPath, projectId } = this.context

    const abiSrc = path.join(__dirname, '../utils/abis')
    const abiDst = path.join(dataPath, '..', `${projectId}-parser-0`)
    await fsCopy(abiSrc, abiDst, { recursive: true })
  }
}
