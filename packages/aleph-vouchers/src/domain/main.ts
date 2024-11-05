import { BlockchainChain } from '@aleph-indexer/framework'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import { CommonBalance, CommonEvent } from '../types/common.js'
import { blockchainTokenContract } from '../utils/index.js'
import fs, { CopyOptions } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import {
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
} from '../types/common.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    // -----------------------------

    // await this.ensureParserAbis()
    // await this.ensureParserIdls()

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
          ]
        : []),
      ...(supportedBlockchains.includes(BlockchainChain.Base)
        ? [
            {
              blockchainId: BlockchainChain.Base,
              account: blockchainTokenContract[BlockchainChain.Base],
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
            },
          ]
        : []),
    ])
  }

  async getTokens(args: CommonBalanceQueryArgs): Promise<CommonBalance[]> {
    const { blockchain } = args
    const [alephCollectionSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephCollectionSC,
        method: 'getTokens',
        args: [args],
      })

    return response as CommonBalance[]
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<CommonBalance[]> {
    const { blockchain } = args
    const [alephCollectionSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephCollectionSC,
        method: 'getBalances',
        args: [args],
      })

    return response as CommonBalance[]
  }

  async getEvents(args: CommonEventQueryArgs): Promise<CommonEvent[]> {
    const { blockchain } = args
    const [alephCollectionSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephCollectionSC,
        method: 'getEvents',
        args: [args],
      })

    return response as CommonEvent[]
  }

  // ------------------- DEBUG METHODS --------------

  protected async ensureParserIdls(): Promise<void> {
    const fsCopy = promisify<string, string, CopyOptions>(fs.cp)

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const { dataPath, projectId } = this.context

    const idlSrc = path.join(__dirname, '../utils/idls')
    const idlDst = path.join(dataPath, '..', `${projectId}-parser-0`)
    await fsCopy(idlSrc, idlDst, { recursive: true })
  }
}
