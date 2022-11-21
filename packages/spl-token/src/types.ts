import { TokenInfo } from '@solana/spl-token-registry'
import BN from 'bn.js'

/**
 * RAW INSTRUCTIONS
 *
 * Read this: https://docs.solana.com/integrations/exchange#depositing
 * And this: https://github.com/solana-labs/solana-program-library/blob/fc0d6a2db79bd6499f04b9be7ead0c400283845e/token/program/src/instruction.rs#L105
 * And this: https://github.com/solana-labs/solana/blob/02bc4e3fc19736bc3f74183f3ceee21598f39139/transaction-status/src/parse_token.rs
 * Examples:
 *
 * On txs:
 * 59eJF2jZ8xhsbveeoRPp5C7MNTXQALE5e8fLqYCW8chUky2gkgSSxrPYAXyBPohMR2YJ8W22x7ZjLXhdwAqWEp2L
 * 3fxdnCHn6sLK1HN39hirjAyjcCjHYsMXRpKT9jLPJVhae3SqKXsocYKijxWBKwGbr3mSSE7Uw7o3GD51NdLSAg1y
 * 3FtUT15zDkCYH4E6nfhDzhqVwkrVRW3egA6eD4CuisiHi2k35YdH415Bb5C9jVf4acx7B1ypgTakpx6X3cJFtwQ4
 *
 * initializeAccount => 31msjyAEvsFWcYLJSVXfjUEK5HtZ9pVFAhWc1qXruSpxdyu3ifx3nv3vKSg4RzGysLXWjvPqRxzrHE7wPXM2D4tc:02:03
 * closeAccount => 5ZrHS6QjdwgoFMXGqLSUnk5jnVCDT8Zam7KrdWpg4VTzbZuGabKNGoEXjv1C5aL5tcjBiGABed47MNNboPXyrzxf:03
 * mintTo => qJL22oJW1juUr6XZdzUDjxBSZscRhvUQMbrBGyqZabi6GFFwR4USUy3PPVPn4unzk1V86VWuQTEJAu5hcKESVBN:01:03
 * burn => 4EQK53nfrtEbYnYNyjZFWFzh9Bok4f5M5Wkh7NJLVDcH7HE6PGbY2DsSPPYppetSqjZGZA1bgWyurA6VYAkCkLiA:02:02
 * transfer => qJL22oJW1juUr6XZdzUDjxBSZscRhvUQMbrBGyqZabi6GFFwR4USUy3PPVPn4unzk1V86VWuQTEJAu5hcKESVBN:01:04
 * transferChecked => 3FtUT15zDkCYH4E6nfhDzhqVwkrVRW3egA6eD4CuisiHi2k35YdH415Bb5C9jVf4acx7B1ypgTakpx6X3cJFtwQ4:00
 * setAuthority => 5h3wFufzx31KZh5shSYquLnVFUGAdM1ym8Yg2xq519ZfhTYaeSsbn5g7BsRyiXszm3CvUETUpsdxaHBHF8jsom3N:00:01
 * approve => 2c4Srogftgjq92ZTMR9zTQUoZjFyEEPBXhBw4yom1m3qASwkArQHQFjBJKPGEzzWqE3pgzvatVGMJA1Y6PPCKeCM:00:00
 * revoke => 2c4Srogftgjq92ZTMR9zTQUoZjFyEEPBXhBw4yom1m3qASwkArQHQFjBJKPGEzzWqE3pgzvatVGMJA1Y6PPCKeCM:00:02
 * syncNative => G92DJX9CG4vWEUPguZk5izfxYLrpWcJDNiiwD4Anhs28yrT8XXhcj6pA1Y5XNXAZ6z4MyfrzKouqtxb582ih6YW:03
 * initializeMint => 4iggaA8mxuB1ATUGMqNYQv7Wk8fjr8KHHodqD5zYbGGhzHpk71axwFuwo4rhK6SE9gkJey4wxqc724Di23gRn5M9:02
 * multisig_transfer => 9wx2Yw2pQUDkoiZoRiHTFDuU3irVFVuP93aAv7QZnsKE5M35FXnMutQprhJoyPEK6G7bZBYcbE1ypW1nNiJGkrR:00:00
 */

export enum SPLTokenEventType {
  MintTo = 'mintTo',
  MintToChecked = 'mintToChecked',
  Burn = 'burn',
  BurnChecked = 'burnChecked',
  InitializeAccount = 'initializeAccount',
  InitializeAccount2 = 'initializeAccount2',
  InitializeAccount3 = 'initializeAccount3',
  CloseAccount = 'closeAccount',
  Transfer = 'transfer',
  TransferChecked = 'transferChecked',
  SetAuthority = 'setAuthority',
  Approve = 'approve',
  ApproveChecked = 'approveChecked',
  Revoke = 'revoke',
  SyncNative = 'syncNative',
  InitializeMint = 'initializeMint',
  InitializeMint2 = 'initializeMint2',

  // @todo
  InitializeMultisig = 'initializeMultisig',
  InitializeMultisig2 = 'initializeMultisig2',
  FreezeAccount = 'freezeAccount',
  ThawAccount = 'thawAccount',
}

export enum AuthorityType {
  /// Authority to mint new tokens
  MintTokens = 'mintTokens',
  /// Authority to freeze any account associated with the Mint
  FreezeAccount = 'freezeAccount',
  /// Owner of a given token account
  AccountOwner = 'accountOwner',
  /// Authority to close a token account
  CloseAccount = 'closeAccount',
}

export enum SPLTokenType {
  Account = 'account',
  Mint = 'mint',
  AccountMint = 'account_mint',
}

export type SPLToken = {
  address: string
  type: SPLTokenType
}

export type SPLTokenRawEventBase = {
  parsed: unknown
  program: string
  programId: string
}

export type SPLTokenRawEventMintTo = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
      amount: string
      mint: string
      mintAuthority: string
    }
    type: SPLTokenEventType.MintTo
  }
}

export type SPLTokenRawEventMintToChecked = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
      mint: string
      mintAuthority: string
      tokenAmount: {
        amount: string
        decimals: number
        uiAmount: number
        uiAmountString: string
      }
    }
    type: SPLTokenEventType.MintToChecked
  }
}

export type SPLTokenRawEventBurn = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
      amount: string
      authority: string
      mint: string
    }
    type: SPLTokenEventType.Burn
  }
}

export type SPLTokenRawEventBurnChecked = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
      authority: string
      mint: string
      tokenAmount: {
        amount: string
        decimals: number
        uiAmount: number
        uiAmountString: string
      }
    }
    type: SPLTokenEventType.BurnChecked
  }
}

export type SPLTokenRawEventInitializeAccountBase<T> = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
      mint: string
      owner: string
      rentSysvar: string
    }
    type: T
  }
}

export type SPLTokenRawEventInitializeAccount =
  SPLTokenRawEventInitializeAccountBase<SPLTokenEventType.InitializeAccount>

export type SPLTokenRawEventInitializeAccount2 =
  SPLTokenRawEventInitializeAccountBase<SPLTokenEventType.InitializeAccount2>

export type SPLTokenRawEventInitializeAccount3 =
  SPLTokenRawEventInitializeAccountBase<SPLTokenEventType.InitializeAccount3>

export type SPLTokenRawEventCloseAccount = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
      destination: string
    } & (
      | {
          owner: string
        }
      | {
          multisigOwner: string
          signers: string[]
        }
    )
    type: SPLTokenEventType.CloseAccount
  }
}

export type SPLTokenRawEventTransfer = SPLTokenRawEventBase & {
  parsed: {
    info: {
      amount: string
      destination: string
      source: string
    } & (
      | {
          authority: string
        }
      | {
          multisigAuthority: string
          signers: string[]
        }
    )
    type: SPLTokenEventType.Transfer
  }
}

export type SPLTokenRawEventTransferChecked = SPLTokenRawEventBase & {
  parsed: {
    info: {
      authority: string
      destination: string
      mint: string
      source: string
      tokenAmount: {
        amount: string
        decimals: number
        uiAmount: number
        uiAmountString: string
      }
    }
    type: SPLTokenEventType.TransferChecked
  }
}

export type SPLTokenRawEventSetAuthority = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
      authority: string
      authorityType: AuthorityType
      newAuthority: string
    }
    type: SPLTokenEventType.SetAuthority
  }
}

export type SPLTokenRawEventApprove = SPLTokenRawEventBase & {
  parsed: {
    info: {
      amount: string
      delegate: string
      owner: string
      source: string
    }
    type: SPLTokenEventType.Approve
  }
}

export type SPLTokenRawEventApproveChecked = SPLTokenRawEventBase & {
  parsed: {
    info: {
      delegate: string
      owner: string
      source: string
      mint: string
      tokenAmount: {
        amount: string
        decimals: number
        uiAmount: number
        uiAmountString: string
      }
    }
    type: SPLTokenEventType.ApproveChecked
  }
}

export type SPLTokenRawEventRevoke = SPLTokenRawEventBase & {
  parsed: {
    info: {
      owner: string
      source: string
    }
    type: SPLTokenEventType.Revoke
  }
}

export type SPLTokenRawEventSyncNative = SPLTokenRawEventBase & {
  parsed: {
    info: {
      account: string
    }
    type: SPLTokenEventType.SyncNative
  }
}

export type SPLTokenRawEventInitializeMintBase<T> = SPLTokenRawEventBase & {
  parsed: {
    info: {
      decimals: number
      mint: string
      mintAuthority: string
      rentSysvar: string
    }
    type: T
  }
}

export type SPLTokenRawEventInitializeMint =
  SPLTokenRawEventInitializeMintBase<SPLTokenEventType.InitializeMint>

export type SPLTokenRawEventInitializeMint2 =
  SPLTokenRawEventInitializeMintBase<SPLTokenEventType.InitializeMint2>

export type SLPTokenRawEvent =
  | SPLTokenRawEventMintTo
  | SPLTokenRawEventMintToChecked
  | SPLTokenRawEventBurn
  | SPLTokenRawEventBurnChecked
  | SPLTokenRawEventInitializeAccount
  | SPLTokenRawEventInitializeAccount2
  | SPLTokenRawEventInitializeAccount3
  | SPLTokenRawEventCloseAccount
  | SPLTokenRawEventTransfer
  | SPLTokenRawEventTransferChecked
  | SPLTokenRawEventSetAuthority
  | SPLTokenRawEventApprove
  | SPLTokenRawEventApproveChecked
  | SPLTokenRawEventRevoke
  | SPLTokenRawEventSyncNative
  | SPLTokenRawEventInitializeMint
  | SPLTokenRawEventInitializeMint2

// ------------------- PARSED ------------------

export type SPLTokenInfo = {
  name: string
  address: string
  programId: string
  tokenInfo: TokenInfo
}

export type SPLTokenStats = {
  // TODO
}

export type SPLTokenEventBase = {
  id: string
  timestamp: number
  type: SPLTokenEventType
  mint: string
  balance: string
  account: string
  owner?: string
}

export type SPLTokenEventMint = SPLTokenEventBase & {
  type: SPLTokenEventType.MintTo
  amount: string
}

export type SPLTokenEventBurn = SPLTokenEventBase & {
  type: SPLTokenEventType.Burn
  amount: string
}

export type SPLTokenEventInitializeAccount = SPLTokenEventBase & {
  type: SPLTokenEventType.InitializeAccount
}

export type SPLTokenEventCloseAccount = SPLTokenEventBase & {
  type: SPLTokenEventType.CloseAccount
  toAccount?: string
}

export type SPLTokenEventTransfer = SPLTokenEventBase & {
  type: SPLTokenEventType.Transfer
  amount: string
  toBalance: string
  toAccount: string
  toOwner?: string
}

export type SPLTokenEventSetAuthority = SPLTokenEventBase & {
  type: SPLTokenEventType.SetAuthority
  newOwner: string
  authorityType: AuthorityType
}

export type SPLTokenEventApprove = SPLTokenEventBase & {
  type: SPLTokenEventType.Approve
  amount: string
  delegate: string
}

export type SPLTokenEventRevoke = SPLTokenEventBase & {
  type: SPLTokenEventType.Revoke
}

export type SPLTokenEventSyncNative = SPLTokenEventBase & {
  type: SPLTokenEventType.SyncNative
}

export type SPLTokenEventInitializeMint = SPLTokenEventBase & {
  type: SPLTokenEventType.InitializeMint
}

export type SPLTokenEvent =
  | SPLTokenEventMint
  | SPLTokenEventBurn
  | SPLTokenEventInitializeAccount
  | SPLTokenEventCloseAccount
  | SPLTokenEventTransfer
  | SPLTokenEventSetAuthority
  | SPLTokenEventApprove
  | SPLTokenEventRevoke
  | SPLTokenEventSyncNative
  | SPLTokenEventInitializeMint

export type SPLTokenIncompleteEvent =
  | IncompleteEvent<SPLTokenEventMint>
  | IncompleteEvent<SPLTokenEventBurn>
  | IncompleteEvent<SPLTokenEventInitializeAccount>
  | IncompleteEvent<SPLTokenEventCloseAccount>
  | IncompleteEvent<SPLTokenEventTransfer>
  | IncompleteEvent<SPLTokenEventSetAuthority>
  | IncompleteEvent<SPLTokenEventApprove>
  | IncompleteEvent<SPLTokenEventRevoke>
  | IncompleteEvent<SPLTokenEventSyncNative>
  | IncompleteEvent<SPLTokenEventInitializeMint>

export type IncompleteEvent<T> = Omit<T, 'mint' | 'toOwner' | 'owner'> & {
  mint?: string
  toOwner?: string
  owner?: string
}

// @TODO: Approve | Revoke | InitializeMultisig | FreezeAccount | SetAuthority

export type SPLTokenEventPublic = SPLTokenEvent & { tokenInfo: TokenInfo }

// ----------------------------- HOLDINGS -----------------------------------

export type SPLAccountBalance = {
  account: string
  owner?: string
  balance: string
  timestamp: number
}

export type SPLAccountHoldings = {
  account: string
  owner?: string
  balance: string
  max: BN
  min: BN
  avg: BN
  events: number
}

// ------------------------ DISCOVERY ----------------------------------

export type DiscoveryFnReturn = {
  mints: string[]
  accounts: string[]
}

export type DiscoveryFn = () => Promise<DiscoveryFnReturn>
