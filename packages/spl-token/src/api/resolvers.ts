import {
  ReadableStorageStream,
  ReadableStorageStreamItem,
  Utils,
} from '@aleph-indexer/core'
import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenEvent,
  SPLTokenInfo,
} from '../types.js'
import BN from 'bn.js'
import {
  getBalanceFromEvent,
  getEventAccounts,
  getMintAndOwnerFromEvent,
} from '../utils/utils.js'
import MainDomain from '../domain/main.js'

export type TokenFilters = {
  mint?: string
}

export type TokenEventsFilters = {
  mint: string
  account?: string
  types?: string[]
  startDate?: number
  endDate?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type AccountHoldingsFilters = {
  mint: string
  account?: string
  startDate?: number
  endDate?: number
  gte?: string
  lte?: string
}

export type TokenHoldersFilters = {
  mint: string
  account?: string
  limit?: number
  skip?: number
  reverse?: boolean
  gte?: string
  lte?: string
}

export class APIResolver {
  constructor(protected domain: MainDomain) {}

  async getTokens(mint?: string): Promise<SPLTokenInfo[]> {
    return await this.filterTokens({ mint })
  }

  async getAccountHoldings({
    mint,
    account,
    startDate,
    endDate,
    gte,
  }: AccountHoldingsFilters): Promise<SPLAccountHoldings[]> {
    const opts: TokenEventsFilters = {
      mint,
      reverse: true,
    }

    // 10
    if (startDate && !endDate) {
      throw new Error(
        'Bad Request: endDate param is mandatory when startDate is supplied',
      )
    }
    // 01
    else if (!startDate && endDate) {
      opts.limit = 1
      opts.endDate = endDate
    }
    // 11
    else if (startDate && endDate) {
      opts.startDate = startDate
      opts.endDate = endDate
    }
    // 00
    else {
      opts.limit = 1
      opts.endDate = Date.now()
    }

    const gteBn = gte ? new BN(gte) : undefined

    const accounts = account
      ? [{ account, mint }]
      : // @note: We dont have the mint->account lookup database yet :(
        // @todo: Create mint->account lookup database and use it here
        this.accountTokenDAL.getAll().pipe(
          new Utils.StreamMap(
            ({ key }: ReadableStorageStreamItem<string, string>) => {
              const [account, mint] = key.split('|')
              return { account, mint }
            },
          ),
        )

    const accountsHoldingsMap: Record<string, SPLAccountHoldings> = {}

    for await (const { account, mint: accMint } of accounts) {
      if (mint !== accMint) continue

      opts.account = account
      const events = this.getTokenEventSource(opts)

      for await (const { value } of events) {
        const eventAccounts = getEventAccounts(value)

        for (const eventAccount of eventAccounts) {
          if (account && account !== eventAccount) continue

          const balance = new BN(getBalanceFromEvent(value, eventAccount))

          const holdings = (accountsHoldingsMap[eventAccount] =
            accountsHoldingsMap[eventAccount] || {
              account: eventAccount,
              balance,
              max: balance,
              min: balance,
              avg: new BN(0),
              events: 0,
            })

          holdings.min = BN.min(holdings.min, balance)
          holdings.max = BN.max(holdings.max, balance)
          holdings.avg.iadd(balance)
          holdings.events++

          if (!holdings.owner) {
            const { owner } = getMintAndOwnerFromEvent(value, eventAccount)
            holdings.owner = owner
          }
        }
      }
    }

    const accountsHoldings = Object.values(accountsHoldingsMap)
    const filteredHoldings: SPLAccountHoldings[] = []

    for (const holdings of accountsHoldings) {
      holdings.avg = holdings.avg.divn(holdings.events)

      if (gteBn) {
        if (holdings.max.gte(gteBn)) {
          filteredHoldings.push(holdings)
        }
        continue
      }

      filteredHoldings.push(holdings)
    }

    return filteredHoldings
  }

  async getTokenEvents({
    mint,
    account,
    types,
    startDate = 0,
    endDate = Date.now(),
    limit = 1000,
    skip = 0,
    reverse = true,
  }: TokenEventsFilters): Promise<SPLTokenEvent[]> {
    if (limit < 1 || limit > 1000)
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const typesMap = types ? new Set(types) : undefined

    const result: SPLTokenEvent[] = []
    const events = this.getTokenEventSource({
      mint,
      startDate,
      endDate,
      account,
      reverse,
      limit: !typesMap ? limit + skip : undefined,
    })

    for await (const { value } of events) {
      // @note: Filter by type
      if (typesMap && !typesMap.has(value.type)) continue

      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(value)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }

  async getTokenHolders({
    mint,
    limit,
    skip = 0,
    reverse = true,
    gte,
    lte,
  }: TokenHoldersFilters): Promise<SPLAccountBalance[]> {
    const isALEPH = mint === 'CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K'

    // @note: Default limit and gte
    limit = limit || (isALEPH ? Number.MAX_SAFE_INTEGER : 1000)

    // @note: Do not add constraints to limit arg when it is ALEPH token
    if (!isALEPH && (limit < 1 || limit > 1000))
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const gteBn = gte ? new BN(gte) : undefined
    const lteBn = lte ? new BN(lte) : undefined

    const hasFilters = gte || lte

    const result: SPLAccountBalance[] = []
    const balances = this.getBalanceAccountDAL(mint).getAllAccountBalances({
      reverse,
      limit: !hasFilters ? limit + skip : undefined,
    })

    for await (const { value } of balances) {
      // @note: Filter by gte || lte
      if (gteBn || lteBn) {
        const balanceBN = new BN(value.balance)

        if (gteBn && balanceBN.lt(gteBn)) continue
        if (lteBn && balanceBN.gt(lteBn)) continue
      }

      // @note: Skip first N events
      if (--skip >= 0) continue

      result.push(value)

      // @note: Stop when after reaching the limit
      if (limit > 0 && result.length >= limit) return result
    }

    return result
  }

  protected getTokenEventSource({
    mint,
    account,
    startDate,
    endDate,
    reverse,
    limit,
  }: TokenEventsFilters): ReadableStorageStream<string, SPLTokenEvent> {
    const opts = { reverse, limit }

    if (account)
      return this.getTokenAccountEventDAL(mint).getAllEntitiesFromTo(
        account,
        startDate,
        endDate,
        opts,
      )

    return this.getTokenEventDAL(mint).getAllFromTo(startDate, endDate, opts)
  }

  protected getTokenEventDAL(mint: string): SPLTokenEventLevelStorage {
    return this.dalFactory.get(
      SPLTokenDAL.Event,
      mint,
    ) as SPLTokenEventLevelStorage
  }

  protected getTokenAccountEventDAL(
    mint: string,
  ): SPLTokenAccountEventLevelStorage {
    return this.dalFactory.get(
      SPLTokenDAL.AccountEvent,
      mint,
    ) as SPLTokenAccountEventLevelStorage
  }

  protected getBalanceAccountDAL(
    mint: string,
  ): SPLTokenBalanceAccountLevelStorage {
    return this.dalFactory.get(
      SPLTokenDAL.BalanceAccount,
      mint,
    ) as SPLTokenBalanceAccountLevelStorage
  }

  protected async filterTokens({
    mint,
  }: TokenFilters): Promise<SPLTokenInfo[]> {
    const domTokens = await this.domain.getTokens()

    const tokens =
      [mint] || Object.values(domTokens).map((token: any) => token.address)

    const result = (tokens as string[])
      .map((address) => domTokens[address])
      .filter((token) => !!token)

    return result
  }
}
