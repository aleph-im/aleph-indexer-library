export function renderDiscovererFiles(
  Name: string,
  filename: string,
): [string, string][] {
  const discovererFileContent = renderDiscovererFile(Name, filename)

  return [[`${filename}`, discovererFileContent]]
}

export function renderDiscovererFile(Name: string, filename: string): string {
  const NAME = filename.toUpperCase().replace(/-/g, '_')

  return `import {
    ${NAME}_PROGRAM_ID,
    ${NAME}_PROGRAM_ID_PK,
} from '../../constants.js'
import { AccountType } from '../../utils/layouts/index.js'
import { ${Name}AccountInfo } from '../../types.js'
import {
    ACCOUNT_DISCRIMINATOR,
    ACCOUNTS_DATA_LAYOUT,
} from '../../utils/layouts/accounts.js'
import { solanaPrivateRPC } from '@aleph-indexer/solana'
import bs58 from 'bs58'
import { AccountInfo, PublicKey } from '@solana/web3.js'

export default class ${Name}Discoverer {
    constructor(
        public accountTypes: Set<AccountType> = new Set(Object.values(AccountType)),
        protected cache: Record<string, ${Name}AccountInfo> = {},
    ) {}

    async loadAccounts(): Promise<${Name}AccountInfo[]> {
        const newAccounts:${Name}AccountInfo[] = []
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
    async getAllAccounts(): Promise<${Name}AccountInfo[]> {
        const connection = solanaPrivateRPC.getConnection()
        const accountsInfo: ${Name}AccountInfo[] = []
        // todo: If you want to only index a subset of account types, you can filter them here
        const accountTypesToFilter: AccountType[] = [/*AccountType.*/]
        for (const type of this.accountTypes) {
          if (accountTypesToFilter.includes(type)) continue
            const accounts = await connection.getProgramAccounts(
              ${NAME}_PROGRAM_ID_PK,
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
                (value: { pubkey: PublicKey; account: AccountInfo<Buffer> }) =>
                  accountsInfo.push(this.deserializeAccountResponse(value, type)),
            )
        }
        return accountsInfo
    }

    deserializeAccountResponse(
        resp: { pubkey: PublicKey; account: AccountInfo<Buffer> },
        type: AccountType,
    ): ${Name}AccountInfo {
        const data = ACCOUNTS_DATA_LAYOUT[type].deserialize(resp.account.data)[0]
        const address = resp.pubkey.toBase58()

        return {
            programId: ${NAME}_PROGRAM_ID,
            type,
            address: address,
            data: data,
        }
    }
}
`
}
