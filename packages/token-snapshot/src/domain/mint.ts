import { StorageValueStream } from '@aleph-indexer/core'
import { EventStorage } from '../dal/event.js'
import { AccountMint, TokenHoldersFilters } from './types.js'
import { SPLTokenHolding } from '../types.js'
import BN from 'bn.js'
import {
  BalanceStateDALIndex,
  AccountBalanceStateStorage,
} from '../dal/balanceState.js'
import { AccountMintStorage } from '../dal/accountMints.js'
import {
  AccountBalanceHistoryStorage,
  BalanceHistoryDALIndex,
} from '../dal/balanceHistory.js'

export class Mint {
  constructor(
    protected address: string,
    protected eventDAL: EventStorage,
    protected balanceStateDAL: AccountBalanceStateStorage,
    protected balanceHistoryDAL: AccountBalanceHistoryStorage,
    protected accountMintDAL: AccountMintStorage,
  ) {}

  async getMintAccounts(
    account?: string,
  ): Promise<StorageValueStream<AccountMint>> {
    const range = account ? [this.address, account] : [this.address]
    return await this.accountMintDAL.getAllValuesFromTo(range, range)
  }

  async addAccount(account: string): Promise<void> {
    const accountMint: AccountMint = {
      mint: this.address,
      account,
    }
    await this.accountMintDAL.save(accountMint)
  }

  async getTokenHoldings({
    timestamp,
    limit,
    skip = 0,
    reverse = true,
    gte,
    lte,
  }: TokenHoldersFilters): Promise<SPLTokenHolding[]> {
    // @note: Default limit and gte
    limit = limit || 1000

    // @note: Do not add constraints to limit arg when it is ALEPH token
    if (limit < 1 || limit > 1000)
      throw new Error('400 Bad Request: 1 <= limit <= 1000')

    const gteBn = gte ? new BN(gte) : undefined
    const lteBn = lte ? new BN(lte) : undefined

    const result: SPLTokenHolding[] = []
    const currentBalances = await this.balanceStateDAL
      .useIndex(BalanceStateDALIndex.Mint)
      .getAllValuesFromTo([this.address], [this.address], {
        reverse,
        limit,
      })

    if (timestamp) {
      for await (const value of currentBalances) {
        const snapshotBalances = await this.balanceHistoryDAL
          .useIndex(BalanceHistoryDALIndex.MintAccount)
          .getAllValuesFromTo(
            [this.address, value.account],
            [this.address, value.account],
          )
        let snapshotBalance: SPLTokenHolding | undefined
        for await (const balance of snapshotBalances) {
          if (
            balance.timestamp < timestamp &&
            (!snapshotBalance || balance.timestamp > snapshotBalance.timestamp)
          ) {
            snapshotBalance = balance
          }
        }
        snapshotBalance = this.filterBalance(snapshotBalance, gteBn, lteBn)
        if (!snapshotBalance) continue

        // @note: Skip first N events
        if (--skip >= 0) continue

        result.push(snapshotBalance)

        // @note: Stop when after reaching the limit
        if (limit > 0 && result.length >= limit) return result
      }
    } else {
      for await (const value of currentBalances) {
        const balance = this.filterBalance(value, gteBn, lteBn)
        if (!balance) continue

        // @note: Skip first N events
        if (--skip >= 0) continue

        result.push(value)

        // @note: Stop when after reaching the limit
        if (limit > 0 && result.length >= limit) return result
      }
    }

    return result
  }

  private filterBalance(
    balance: SPLTokenHolding | undefined,
    gteBn: BN | undefined,
    lteBn: BN | undefined,
  ): SPLTokenHolding | undefined {
    if (!balance) return undefined

    // @note: Filter by gte || lte
    if (gteBn || lteBn) {
      const balanceBN = new BN(balance.balances.total)

      if (gteBn && balanceBN.lte(gteBn)) return undefined
      if (lteBn && balanceBN.gte(lteBn)) return undefined
    }

    return balance
  }
}
