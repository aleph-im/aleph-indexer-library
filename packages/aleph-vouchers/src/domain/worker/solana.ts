import {
  AccountIndexerRequestArgs,
  IndexerDomainContext,
  ParserContext,
} from '@aleph-indexer/framework'
import { SolanaParsedInstructionContext } from '@aleph-indexer/solana'
import {
  createMPLTokenEventDAL,
  MPLTokenEventDALIndex,
} from '../../dal/solana/mplTokenEvent.js'
import { MPLTokenEvent, MPLTokenBalance } from '../../types/solana.js'
import {
  createMPLTokenBalanceDAL,
  MPLTokenBalanceDALIndex,
} from '../../dal/solana/mplTokenBalance.js'
import {
  CommonBalance,
  BlockchainWorkerI,
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
  CommonEvent,
  CommonToken,
  CommonTokenQueryArgs,
} from '../../types/common.js'
import { SolanaEventParser } from '../parser/solana.js'
import { getCommonBalances, getCommonEvents } from '../../utils/query.js'
import { isMPLTokenParsedInstruction } from '../../utils/solana.js'

export default class SolanaWorkerDomain implements BlockchainWorkerI {
  constructor(
    protected context: IndexerDomainContext,
    protected mplTokenEventDAL = createMPLTokenEventDAL(context.dataPath),
    protected mplTokenBalanceDAL = createMPLTokenBalanceDAL(context.dataPath),
    protected parser = new SolanaEventParser(mplTokenEventDAL),
  ) {}

  async onNewAccount(config: AccountIndexerRequestArgs): Promise<void> {
    console.log(`Indexing`, JSON.stringify(config))
  }

  async filterEntity(
    context: ParserContext,
    entity: SolanaParsedInstructionContext,
  ): Promise<boolean> {
    return isMPLTokenParsedInstruction(entity.instruction)
  }

  async indexEntities(
    context: ParserContext,
    entities: SolanaParsedInstructionContext[],
  ): Promise<void> {
    const { blockchainId } = context
    console.log(`Index ${blockchainId} ixs`, JSON.stringify(entities, null, 2))

    const parsedEvents: MPLTokenEvent[] = []
    const parsedBalances: MPLTokenBalance[] = []

    // @note: Parsing events

    for (const entity of entities) {
      const parsedEvent = await this.parser.parseEvent(blockchainId, entity)
      if (!parsedEvent) continue
      parsedEvents.push(parsedEvent)

      const parsedBalance = this.parser.parseBalanceFromEvent(parsedEvent)
      parsedBalances.push(...parsedBalance)
    }

    if (parsedEvents.length) {
      await this.mplTokenEventDAL.save(parsedEvents)
    }

    if (parsedBalances.length) {
      await this.mplTokenBalanceDAL.save(parsedBalances)
    }
  }

  async getTokens(args: CommonTokenQueryArgs): Promise<CommonToken[]> {
    const balances = await getCommonBalances(
      args,
      this.mplTokenBalanceDAL,
      MPLTokenBalanceDALIndex.BlockchainAsset,
    )

    const tokens: CommonToken[] = []

    for await (const balance of balances) {
      const {
        blockchain,
        asset: account,
        owner,
        collection,
        burned,
        name,
        url,
      } = balance
      if (burned) continue

      tokens.push({
        blockchain,
        account,
        collection,
        owner,
        name,
        url,
      })
    }

    return tokens
  }

  async getBalances(args: CommonBalanceQueryArgs): Promise<CommonBalance[]> {
    const balances = await getCommonBalances(
      args,
      this.mplTokenBalanceDAL,
      MPLTokenBalanceDALIndex.BlockchainOwner,
    )

    const ownerMap: Record<string, CommonBalance> = {}

    for await (const balance of balances) {
      const { blockchain, owner: account, burned } = balance
      if (!account) continue
      if (burned) continue

      const ownerTokens = (ownerMap[account] = ownerMap[account] || {
        blockchain,
        account,
        tokens: [],
      })

      const { asset, owner, collection, name, url } = balance

      ownerTokens.tokens.push({
        blockchain,
        account: asset,
        owner,
        collection,
        name,
        url,
      })
    }

    return Object.values(ownerMap)
  }

  async getEvents(args: CommonEventQueryArgs): Promise<CommonEvent[]> {
    return getCommonEvents(args, this.mplTokenEventDAL, MPLTokenEventDALIndex)
  }
}
