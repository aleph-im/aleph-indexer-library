import { 
  IndexerMainDomain, 
  BlockchainChain, 
  IndexerMainDomainWithDiscovery, 
  AccountIndexerConfigWithMeta,
  IndexerMainDomainContext,
} from '@aleph-indexer/framework'
import {
  Balance,
  BalanceQueryArgs,
  Snapshot,
  SolanaBalance,
  TransferEvent,
  TransferEventQueryArgs,
} from '../types.js'
import { blockchainTokenContract } from '../utils/index.js'
import { solanaSnapshot } from './solanaSnapshot.js'
import { createSnapshotDAL } from '../dal/snapshot.js'

export default class MainDomain 
  extends IndexerMainDomain 
  implements IndexerMainDomainWithDiscovery 
{
  protected firstSnapshotTimestamp?: number

  constructor(
    protected context: IndexerMainDomainContext,
    protected tokenSnapshotDAL = createSnapshotDAL(context.dataPath),
    // note: Snapshot interval is set to 1 hour
    protected discoveryInterval = 1000 * 60 * 60,
  ) {
    super(context, {
      discoveryInterval: 1000 * 60 * 60,
    })
  }

  async discoverAccounts(): Promise<
    AccountIndexerConfigWithMeta<SolanaBalance>[]
  > {
    const balances = await solanaSnapshot()

    console.log(`Snapshot taken, discovered ${balances.length} holders`)

    const timestamp = Date.now()
    if (!this.firstSnapshotTimestamp) {
      this.firstSnapshotTimestamp = timestamp
    }

    await this.tokenSnapshotDAL.save({
      timestamp,
      balances,
    })

    return []
    /* note: not necessary to index accounts
    return balances.map(account => ({
      blockchainId: BlockchainChain.Solana,
      account: account.account,
      meta: account,
      index: {},
    }))
    */
  }

  async init(): Promise<void> {
    await super.init()

    await this.indexAccounts([
      {
        blockchainId: BlockchainChain.Ethereum,
        account: blockchainTokenContract[BlockchainChain.Ethereum],
        index: { logs: true },
      },
      // {
      //   blockchainId: BlockchainChain.Bsc,
      //   account: blockchainTokenContract[BlockchainChain.Bsc],
      //   index: { logs: true },
      // },
    ])
  }

  async getEvents(args: TransferEventQueryArgs): Promise<TransferEvent[]> {
    const { blockchain } = args
    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getEvents',
        args: [args],
      })

    return response as TransferEvent[]
  }

  async getBalances(args: BalanceQueryArgs): Promise<Balance[]> {
    const { blockchain } = args

    if (blockchain === BlockchainChain.Solana) {
      const lastSnapshot = await this.getSnapshot()
      return lastSnapshot.balances.map(balance => ({
        ...balance,
        blockchain,
      }))
    }

    const [alephTokenSC] = this.accounts[blockchain].values()

    const response = await this.context.apiClient
      .useBlockchain(blockchain)
      .invokeDomainMethod({
        account: alephTokenSC,
        method: 'getBalances',
        args: [args],
      })

    return response as Balance[]
  }

  // note: implemented for Solana.
  // returns last snapshot if timestamp is not provided
  // if provided, returns last snapshot taken from that timestamp
  async getSnapshot(timestamp?: number): Promise<Snapshot> {
    const currentTimestamp = Date.now()

    if (timestamp) {
      if (timestamp <= 0 || timestamp >= currentTimestamp) {
        throw new Error('Invalid timestamp')
      }
      if (this.firstSnapshotTimestamp && timestamp < this.firstSnapshotTimestamp) {
        throw new Error('Snapshot not available')
      }
    }

    const referenceTimestamp = timestamp || currentTimestamp
    const snapshot = await this.tokenSnapshotDAL
      .getLastValueFromTo(
        [this.firstSnapshotTimestamp],
        [referenceTimestamp],
      )

    if (!snapshot) {
      return {
        timestamp: currentTimestamp,
        balances: []
      }
    }

    return snapshot
  }
}
