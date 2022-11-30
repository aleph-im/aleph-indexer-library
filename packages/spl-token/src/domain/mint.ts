import { EventStorage } from '../dal/event.js'
import {
  AccountHoldingsFilters,
  AccountHoldingsOptions,
  MintEventsFilters,
} from './types.js'
import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenEvent,
} from '../types.js'
import { Account } from './account.js'
import { BalanceStateStorage } from '../dal/balanceState.js'
import BN from 'bn.js'

export class Mint {
  protected accounts: string[]

  constructor(
    protected address: string,
    protected eventDAL: EventStorage,
    protected balanceStateDAL: BalanceStateStorage,
    protected balanceHistoryDAL: BalanceStateStorage,
  ) {
    this.accounts = []
  }

  addAccount(account: string): void {
    if (!this.accounts.includes(account)) this.accounts.push(account)
  }

  async getEvents(filters: MintEventsFilters): Promise<SPLTokenEvent[]> {
    let result: SPLTokenEvent[] = []
    const accounts = filters.account ? [filters.account] : this.accounts

    const promises = accounts.map(async (account) => {
      const instance = new Account(account, this.eventDAL)
      const events = await instance.getEvents(filters)
      result = [...result, ...events]
    })

    await Promise.all(promises)

    return result
  }

  async getTokenHolders(): Promise<SPLAccountBalance[]> {
    const balances = await this.balanceStateDAL.getMany(this.accounts)
    return balances.filter((balance) => balance !== undefined)
  }

  async getTokenHoldings({
    account,
    startDate,
    endDate,
    gte,
  }: AccountHoldingsFilters): Promise<SPLAccountHoldings[]> {
    const accountsHoldingsMap: Record<string, SPLAccountHoldings> = {}

    const accounts = account ? [account] : this.accounts
    if (accounts.length === 0) return []
    const orderedAccounts = accounts.sort()

    const opts: AccountHoldingsOptions = {
      reverse: true,
    }

    const gteBn = gte ? new BN(gte) : undefined

    const promises = orderedAccounts.map(async (account) => {
      const balances = await this.balanceHistoryDAL.getAllFromTo(
        [account, startDate],
        [account, endDate],
        opts,
      )
      for await (const { value: accountBalance } of balances) {
        const balance = new BN(accountBalance.balance)
        const holding = (accountsHoldingsMap[account] = accountsHoldingsMap[
          account
        ] || {
          account: account,
          balance,
          max: balance,
          min: balance,
          avg: new BN(0),
          events: 0,
        })

        holding.min = BN.min(holding.min, balance)
        holding.max = BN.max(holding.max, balance)
        holding.avg.iadd(balance)
        holding.events++
        if (!holding.owner) {
          holding.owner = accountBalance.owner
        }
      }
    })

    await Promise.all(promises)

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
}
