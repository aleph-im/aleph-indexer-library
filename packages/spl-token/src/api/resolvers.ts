import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenEvent,
  SPLTokenInfo,
} from '../types.js'
import BN from 'bn.js'
import MainDomain from '../domain/main.js'
import { ALEPH_MINT_ADDRESS } from '../constants.js'

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
    return await this.domain.getAccountHoldings(mint, {
      account,
      startDate,
      endDate,
      gte,
    })
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

    return await this.domain.getMintEvents(mint, {
      account,
      startDate,
      endDate,
      reverse,
      limit: !typesMap ? limit + skip : undefined,
    })
  }

  async getTokenHolders({
    mint,
    limit,
    skip = 0,
    reverse = true,
    gte,
    lte,
  }: TokenHoldersFilters): Promise<SPLAccountBalance[]> {
    const isALEPH = mint === ALEPH_MINT_ADDRESS

    // @note: Default limit and gte
    limit = limit || (isALEPH ? Number.MAX_SAFE_INTEGER : 1000)

    // @note: Do not add constraints to limit arg when it is ALEPH token
    if (!isALEPH && (limit < 1 || limit > 1000))
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const gteBn = gte ? new BN(gte) : undefined
    const lteBn = lte ? new BN(lte) : undefined

    const result: SPLAccountBalance[] = []
    const balances = await this.domain.getTokenHolders(mint)

    let sortedBalances: SPLAccountBalance[] = []
    if (reverse) {
      sortedBalances = balances.sort((a, b) =>
        b.balance.localeCompare(a.balance),
      )
    } else {
      sortedBalances = balances.sort((a, b) =>
        a.balance.localeCompare(b.balance),
      )
    }

    for (const value of sortedBalances) {
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
