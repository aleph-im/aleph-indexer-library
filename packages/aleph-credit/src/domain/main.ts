import fs, { CopyOptions } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { IndexerMainDomain } from '@aleph-indexer/framework'
import {
  CommonQueryArgs,
  CommonTransfer,
  CommonTransferQueryArgs,
} from '../types/common.js'
import {
  BlockchainId,
  blockchainTokenContractMap,
  TokenId,
} from '../utils/index.js'
import { CommonTransfersQueryArgs } from '../types/common.js'

export default class MainDomain extends IndexerMainDomain {
  async init(): Promise<void> {
    await super.init()

    // -----------------------------

    await this.ensureParserAbis()

    // -----------------------------

    const { supportedBlockchains } = this.context
    const accounts = []

    for (const blockchainId of Object.values(BlockchainId)) {
      if (!supportedBlockchains.includes(blockchainId)) continue

      const tokens = Object.keys(
        blockchainTokenContractMap[blockchainId],
      ) as TokenId[]

      for (const tokenId of tokens) {
        const account = blockchainTokenContractMap[blockchainId][tokenId]
        if (!account)
          throw new Error(
            `${tokenId} token not supported in ${blockchainId} chain`,
          )

        accounts.push({
          blockchainId,
          account,
          index: { logs: true },
        })
      }
    }

    await this.indexAccounts(accounts)
  }

  async getTransfers(
    args: CommonTransfersQueryArgs,
  ): Promise<CommonTransfer[]> {
    const { blockchain, token } = args
    args.token =
      blockchainTokenContractMap[blockchain][token as TokenId] || token

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
    args.token =
      blockchainTokenContractMap[blockchain][token as TokenId] || token

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
    args.token =
      blockchainTokenContractMap[blockchain][token as TokenId] || token

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

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const { dataPath, projectId } = this.context

    const abiSrc = path.join(__dirname, '../utils/abis')
    const abiDst = path.join(dataPath, '..', `${projectId}-parser-0`)
    await fsCopy(abiSrc, abiDst, { recursive: true })
  }
}
