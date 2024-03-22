import MainDomain from '../domain/main.js'
import {
  AccountType,
  MarinadeFinanceEvent,
  InstructionType,
} from '../utils/layouts/index.js'
import {
  GlobalMarinadeFinanceStats,
  MarinadeFinanceAccountInfo,
  MarinadeFinanceAccountData,
} from '../types.js'

export type AccountsFilters = {
  types?: AccountType[]
  accounts?: string[]
  includeStats?: boolean
}

export type EventsFilters = {
  account: string
  types?: InstructionType[]
  startDate?: number
  endDate?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type GlobalStatsFilters = AccountsFilters

export class APIResolvers {
  constructor(protected domain: MainDomain) {}

  async getAccounts(
    args: AccountsFilters,
  ): Promise<MarinadeFinanceAccountInfo[]> {
    const acountsData = await this.filterAccounts(args)
    return acountsData.map(({ info, stats }) => ({ ...info, stats }))
  }

  async getAccountEvents(
    filters: EventsFilters,
  ): Promise<MarinadeFinanceEvent[]> {
    return await this.domain.getAccountEvents(filters)
  }

  public async getGlobalStats(
    args: GlobalStatsFilters,
  ): Promise<GlobalMarinadeFinanceStats> {
    const acountsData = await this.filterAccounts(args)
    const addresses = acountsData.map(({ info }) => info.address)

    return this.domain.getGlobalStats(addresses)
  }

  protected async filterAccounts({
    types,
    accounts,
    includeStats,
  }: AccountsFilters): Promise<MarinadeFinanceAccountData[]> {
    const accountMap = await this.domain.getAccounts(includeStats)

    accounts =
      accounts ||
      Object.values(accountMap).map((account) => account.info.address)

    let accountsData = accounts
      .map((address) => accountMap[address])
      .filter((account) => !!account)

    if (types !== undefined) {
      accountsData = accountsData.filter(({ info }) =>
        types!.includes(info.type),
      )
    }

    return accountsData
  }
}
