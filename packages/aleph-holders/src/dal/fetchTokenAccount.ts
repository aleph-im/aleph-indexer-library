import {
    PendingWorkStorage,
} from '@aleph-indexer/core'
import { TokenAccount } from './tokenAccount'
  
export type FetchTokenAccountStorage = PendingWorkStorage<TokenAccount>

export function createFetchTokenAccountDAL(
    path: string,
    name = 'fetcher_token_accounts',
): FetchTokenAccountStorage {
    return new PendingWorkStorage<TokenAccount>({
        name,
        path,
        count: true,
    })
}
  