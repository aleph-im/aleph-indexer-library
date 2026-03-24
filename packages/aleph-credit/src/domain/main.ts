import fs, { CopyOptions } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { config } from '@aleph-indexer/core'
import {
  getBlockchainConfig,
  IndexerMainDomain,
} from '@aleph-indexer/framework'
import {
  CommonQueryArgs,
  CommonTransfer,
  CommonTransferQueryArgs,
} from '../types/common.js'
import { getChainConfig } from '../config/index.js'
import { CommonTransfersQueryArgs } from '../types/common.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    // -----------------------------

    await this.ensureParserAbis()

    // -----------------------------

    const supportedBlockchains = this.context.supportedBlockchains.map(
      (blockchain) => getBlockchainConfig(blockchain).id,
    )

    const accounts = []

    for (const blockchainId of supportedBlockchains) {
      const chainConfig = getChainConfig(blockchainId)

      // Index token contracts
      for (const [, tokenConfig] of Object.entries(
        chainConfig.tokenContracts,
      )) {
        accounts.push({
          blockchainId,
          account: tokenConfig.address,
          index: {
            logs: {
              params: {
                pageLimit: 1000,
                minBlockHeight: Number(
                  config.INDEXER_MIN_BLOCK_HEIGHT || 24136053,
                ),
              },
            },
          },
        })
      }

      // Index credit contract for native payments
      if (chainConfig.creditContract.nativePayments) {
        accounts.push({
          blockchainId,
          account: chainConfig.creditContract.address,
          index: {
            logs: {
              params: {
                pageLimit: 1000,
                minBlockHeight: Number(
                  config.INDEXER_MIN_BLOCK_HEIGHT || 24136053,
                ),
              },
            },
          },
        })
      }
    }

    await this.indexAccounts(accounts)
  }

  private resolveTokenAddress(blockchain: string, token: string): string {
    const chainConfig = getChainConfig(blockchain)
    const tokenConfig = chainConfig.tokenContracts[token]
    return tokenConfig ? tokenConfig.address : token
  }

  async getTransfers(
    args: CommonTransfersQueryArgs,
  ): Promise<CommonTransfer[]> {
    const { blockchain, token } = args
    args.token = this.resolveTokenAddress(blockchain, token)

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: args.token,
        method: 'getTransfers',
        args: [args],
      })

    return response as CommonTransfer[]
  }

  async getTransfer(
    args: CommonTransferQueryArgs,
  ): Promise<CommonTransfer | undefined> {
    const { blockchain, token } = args
    args.token = this.resolveTokenAddress(blockchain, token)

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: args.token,
        method: 'getTransfer',
        args: [args],
      })

    return response as CommonTransfer
  }

  async getPendingTransfers(args: CommonQueryArgs): Promise<CommonTransfer[]> {
    const { blockchain, token } = args
    args.token = this.resolveTokenAddress(blockchain, token)

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: args.token,
        method: 'getPendingTransfers',
        args: [args],
      })

    return response as CommonTransfer[]
  }

  // @note: Quick fix to copy abis to the parser dir (needed until we detect proxy contracts to forward the address to get the destination contract abi)
  protected async ensureParserAbis(): Promise<void> {
    const fsCopy = promisify<string, string, CopyOptions>(fs.cp)

    const { dataPath, projectId } = this.context

    const abiSrc = path.resolve('config/abis')
    const abiDst = path.join(dataPath, '..', `${projectId}-parser-0`)
    await fsCopy(abiSrc, abiDst, { recursive: true })
  }
}
