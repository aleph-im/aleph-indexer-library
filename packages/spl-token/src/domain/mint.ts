import { StorageValueStream } from '@aleph-indexer/core'
import { EventStorage } from '../dal/event.js'
import {
  AccountHoldingsFilters,
  AccountHoldingsOptions,
  AccountMint,
  MintEventsFilters,
  TokenHoldersFilters,
} from './types.js'
import {
  SPLAccountBalance,
  SPLAccountHoldings,
  SPLTokenEvent,
} from '../types.js'
import BN from 'bn.js'
import { Account } from './account.js'
import {
  BalanceStateDALIndex,
  AccountBalanceStateStorage,
} from '../dal/balanceState.js'
import { AccountMintStorage } from '../dal/accountMints.js'
import { ALEPH_MINT_ADDRESS } from '../constants.js'

export class Mint {
  constructor(
    protected address: string,
    protected eventDAL: EventStorage,
    protected balanceStateDAL: AccountBalanceStateStorage,
    protected balanceHistoryDAL: AccountBalanceStateStorage,
    protected accountMintDAL: AccountMintStorage,
  ) {}

  async getMintAccounts(
    account?: string,
  ): Promise<StorageValueStream<AccountMint>> {
    const range = account ? [this.address, account] : [this.address]
    return await this.accountMintDAL.getAllValuesFromTo(range, range)
  }

  async getAccountsByOwner(
    owner: string,
  ): Promise<StorageValueStream<AccountMint>> {
    const range = [this.address, owner]
    return await this.balanceHistoryDAL.useIndex('mint_owner')
      .getAllValuesFromTo(range, range)
  }

  async addAccount(account: string): Promise<void> {
    const accountMint: AccountMint = {
      mint: this.address,
      account,
    }
    await this.accountMintDAL.save(accountMint)
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

  async getTokenHolders({
    limit,
    skip = 0,
    reverse = true,
    gte,
    lte,
  }: TokenHoldersFilters): Promise<SPLAccountBalance[]> {
    const isALEPH = this.address === ALEPH_MINT_ADDRESS

    // @note: Default limit and gte
    limit = limit || (isALEPH ? Number.MAX_SAFE_INTEGER : 1000)

    // @note: Do not add constraints to limit arg when it is ALEPH token
    if (!isALEPH && (limit < 1 || limit > 1000))
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const gteBn = gte ? new BN(gte) : undefined
    const lteBn = lte ? new BN(lte) : undefined

    const result: SPLAccountBalance[] = []

    const balances = await this.balanceStateDAL
      .useIndex(BalanceStateDALIndex.BalanceAccount)
      .getAllValuesFromTo([this.address], [this.address], { reverse, limit })

    for await (const value of balances) {
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

  async getTokenHoldings({
    account,
    owner,
    startDate,
    endDate,
    gte,
  }: AccountHoldingsFilters): Promise<SPLAccountHoldings[]> {
    const accountsHoldingsMap: Record<string, SPLAccountHoldings> = {}
    const opts: AccountHoldingsOptions = {
      reverse: true,
    }
    const gteBn = gte ? new BN(gte) : undefined

    const accountMints = owner ? await this.getAccountsByOwner(owner) :
      await this.getMintAccounts(account)

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
