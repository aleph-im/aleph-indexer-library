import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenEvent,
  SPLTokenInfo,
} from '../types.js'
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
    const accountHoldings = await this.domain.getAccountHoldings(mint, {
      account,
      startDate,
      endDate,
      gte,
    })

    return accountHoldings.sort((a, b) => a.account.localeCompare(b.account))
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

    const events = await this.domain.getMintEvents(mint, {
      account,
      startDate,
      endDate,
      reverse,
      limit: !typesMap ? limit + skip : undefined,
    })

    return events
  }

  async getTokenHolders(
    filters: TokenHoldersFilters,
  ): Promise<SPLAccountBalance[]> {
    return await this.domain.getTokenHolders(filters.mint, filters)
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
