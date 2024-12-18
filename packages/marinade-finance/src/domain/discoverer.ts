import { BlockchainChain } from '@aleph-indexer/framework'
import {
  MARINADE_FINANCE_PROGRAM_ID,
  MARINADE_FINANCE_PROGRAM_ID_PK,
} from '../constants.js'
import { AccountType } from '../utils/layouts/index.js'
import { MarinadeFinanceAccountInfo } from '../types.js'
import {
  ACCOUNT_DISCRIMINATOR,
  ACCOUNTS_DATA_LAYOUT,
} from '../utils/layouts/accounts.js'
import bs58 from 'bs58'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { getSolanaRPC } from '../utils/solana.js'

export default class AccountDiscoverer {
  constructor(
    public accountTypes: Set<AccountType> = new Set(Object.values(AccountType)),
    protected cache: Record<string, MarinadeFinanceAccountInfo> = {},
  ) {}

  async loadAccounts(): Promise<MarinadeFinanceAccountInfo[]> {
    const newAccounts: MarinadeFinanceAccountInfo[] = []
    const accounts = await this.getAllAccounts()

    for (const accountInfo of accounts) {
      if (this.cache[accountInfo.address]) continue

      this.cache[accountInfo.address] = accountInfo
      newAccounts.push(this.cache[accountInfo.address])
    }

    return newAccounts
  }

  getAccountType(address: string): AccountType {
    return this.cache[address].type
  }

  /**
   * Fetches all accounts from the program. Useful to filter which accounts should be indexed.
   */
  async getAllAccounts(): Promise<MarinadeFinanceAccountInfo[]> {
    const connection = getSolanaRPC(BlockchainChain.Solana) as any

    const accountsInfo: MarinadeFinanceAccountInfo[] = []
    // todo: If you want to only index a subset of account types, you can filter them here
    const accountTypesToFilter: AccountType[] = [
      /*AccountType.*/
    ]
    for (const type of this.accountTypes) {
      if (accountTypesToFilter.includes(type)) continue
      const accounts = await connection.getProgramAccounts(
        MARINADE_FINANCE_PROGRAM_ID_PK,
        {
          filters: [
            {
              memcmp: {
                bytes: bs58.encode(ACCOUNT_DISCRIMINATOR[type]),
                offset: 0,
              },
            },
          ],
        },
      )
      accounts.map(
        (value: { pubkey: PublicKey; account: AccountInfo<Buffer> }) => {
          const accountInfo = this.deserializeAccountResponse(value, type)
          if (accountInfo) accountsInfo.push(accountInfo)
        },
      )
    }
    return accountsInfo
  }

  deserializeAccountResponse(
    resp: { pubkey: PublicKey; account: AccountInfo<Buffer> },
    type: AccountType,
  ): MarinadeFinanceAccountInfo | undefined {
    try {
      const data = ACCOUNTS_DATA_LAYOUT[type].deserialize(resp.account.data)[0]
      const address = resp.pubkey.toBase58()

      return {
        programId: MARINADE_FINANCE_PROGRAM_ID,
        type,
        address: address,
        ...data,
      }
    } catch (e) {
      // layout changed on program update?
      console.log('Error parsing account', e)
      return
    }
  }
}
