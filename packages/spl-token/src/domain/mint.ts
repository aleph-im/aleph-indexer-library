import { StorageValueStream } from '@aleph-indexer/core'
import { EventStorage } from '../dal/event.js'
import {
  AccountHoldingsFilters,
  AccountHoldingsOptions,
  AccountMint,
  MintEventsFilters,
} from './types.js'
import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenEvent,
} from '../types.js'
import BN from 'bn.js'
import { Account } from './account.js'
import { BalanceStateStorage } from '../dal/balanceState.js'
import { AccountMintStorage } from '../dal/accountMints.js'

export class Mint {
  constructor(
    protected address: string,
    protected eventDAL: EventStorage,
    protected balanceStateDAL: BalanceStateStorage,
    protected balanceHistoryDAL: BalanceStateStorage,
    protected accountMintDAL: AccountMintStorage,
  ) {}

  async getMintAccounts(
    account?: string,
  ): Promise<StorageValueStream<AccountMint>> {
    const range = account ? [this.address, account] : [this.address]
    return await this.accountMintDAL.getAllValuesFromTo(range, range)
  }

  addAccount(account: string): void {
    const accountMint: AccountMint = {
      mint: this.address,
      account,
    }
    this.accountMintDAL.save(accountMint)
  }

  async getEvents(filters: MintEventsFilters): Promise<SPLTokenEvent[]> {
    let result: SPLTokenEvent[] = []
    const accountMints = await this.getMintAccounts(filters.account)

    for await (const { account } of accountMints) {
      const instance = new Account(account, this.eventDAL)
      const events = await instance.getEvents(filters)
      result = [...result, ...events]
    }

    return result
  }

  async getTokenHolders(): Promise<SPLAccountBalance[]> {
    const accountMints = await this.getMintAccounts()
    const balances = []

    for await (const { account } of accountMints) {
      const balance = await this.balanceStateDAL.getFirstValueFromTo(
        [account],
        [account],
      )
      if (balance) {
        balances.push(balance)
      }
    }

    return balances
  }

  async getTokenHoldings({
    account,
    startDate,
    endDate,
    gte,
  }: AccountHoldingsFilters): Promise<SPLAccountHoldings[]> {
    const accountsHoldingsMap: Record<string, SPLAccountHoldings> = {}
    const opts: AccountHoldingsOptions = {
      reverse: true,
    }
    const gteBn = gte ? new BN(gte) : undefined

    const accountMints = await this.getMintAccounts(account)

    for await (const { account } of accountMints) {
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
}
