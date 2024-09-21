import { BlockchainId } from '@aleph-indexer/framework'
import { TokenInfo } from '@solana/spl-token-registry'
import {
  CommonBalanceQueryArgs,
  CommonEvent,
  CommonEventQueryArgs,
} from './common'

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
  InitializeImmutableOwner = 'initializeImmutableOwner',
  GetAccountDataSize = 'getAccountDataSize',

  // @todo
  // ------
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

export enum SPLTokenAccountType {
  Account = 'account',
  Mint = 'mint',
  // MintAccount = 'mint_account',
}

export type SPLTokenAccountMeta =
  | {
      type: SPLTokenAccountType.Mint
    }
  | {
      mint: string
      type: SPLTokenAccountType.Account
    }

export type SPLTokenInstructionBase = {
  parsed: unknown
  program: string
  programId: string
}

export type SPLTokenInstructionMintTo = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionMintToChecked = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionBurn = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionBurnChecked = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionInitializeAccountBase<T> =
  SPLTokenInstructionBase & {
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

export type SPLTokenInstructionInitializeAccount =
  SPLTokenInstructionInitializeAccountBase<SPLTokenEventType.InitializeAccount>

export type SPLTokenInstructionInitializeAccount2 =
  SPLTokenInstructionInitializeAccountBase<SPLTokenEventType.InitializeAccount2>

export type SPLTokenInstructionInitializeAccount3 =
  SPLTokenInstructionInitializeAccountBase<SPLTokenEventType.InitializeAccount3>

export type SPLTokenInstructionCloseAccount = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionTransfer = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionTransferChecked = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionSetAuthority = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionApprove = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionApproveChecked = SPLTokenInstructionBase & {
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

export type SPLTokenInstructionRevoke = SPLTokenInstructionBase & {
  parsed: {
    info: {
      owner: string
      source: string
    }
    type: SPLTokenEventType.Revoke
  }
}

export type SPLTokenInstructionSyncNative = SPLTokenInstructionBase & {
  parsed: {
    info: {
      account: string
    }
    type: SPLTokenEventType.SyncNative
  }
}

export type SPLTokenInstructionInitializeMintBase<T> =
  SPLTokenInstructionBase & {
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

export type SPLTokenInstructionInitializeMint =
  SPLTokenInstructionInitializeMintBase<SPLTokenEventType.InitializeMint>

export type SPLTokenInstructionInitializeMint2 =
  SPLTokenInstructionInitializeMintBase<SPLTokenEventType.InitializeMint2>

export type SPLTokenInstructionInitializeImmutableOwner =
  SPLTokenInstructionBase & {
    parsed: {
      info: {
        account: string
      }
      type: SPLTokenEventType.InitializeImmutableOwner
    }
  }

export type SPLTokenInstructionGetAccountDataSize = SPLTokenInstructionBase & {
  parsed: {
    info: {
      extensionTypes: unknown[]
      mint: string
    }
    type: SPLTokenEventType.GetAccountDataSize
  }
}

export type SLPTokenInstruction =
  | SPLTokenInstructionMintTo
  | SPLTokenInstructionMintToChecked
  | SPLTokenInstructionBurn
  | SPLTokenInstructionBurnChecked
  | SPLTokenInstructionInitializeAccount
  | SPLTokenInstructionInitializeAccount2
  | SPLTokenInstructionInitializeAccount3
  | SPLTokenInstructionCloseAccount
  | SPLTokenInstructionTransfer
  | SPLTokenInstructionTransferChecked
  | SPLTokenInstructionSetAuthority
  | SPLTokenInstructionApprove
  | SPLTokenInstructionApproveChecked
  | SPLTokenInstructionRevoke
  | SPLTokenInstructionSyncNative
  | SPLTokenInstructionInitializeMint
  | SPLTokenInstructionInitializeMint2
  | SPLTokenInstructionInitializeImmutableOwner
  | SPLTokenInstructionGetAccountDataSize

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

export type SPLTokenEventBase = CommonEvent & {
  id: string
  blockchain: BlockchainId
  timestamp: number
  slot: number
  type: SPLTokenEventType
  mint: string
  account?: string
  owner?: string
  balance?: string
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
  account: string
}

export type SPLTokenEventCloseAccount = SPLTokenEventBase & {
  type: SPLTokenEventType.CloseAccount
  toAccount?: string
}

export type SPLTokenEventTransfer = SPLTokenEventBase & {
  type: SPLTokenEventType.Transfer
  amount: string
  account: string
  toAccount: string
  balance?: string
  toBalance?: string
  owner?: string
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

export type SPLTokenEventInitializeImmutableOwner = SPLTokenEventBase & {
  type: SPLTokenEventType.InitializeImmutableOwner
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
  | SPLTokenEventInitializeImmutableOwner

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
  | IncompleteEvent<SPLTokenEventInitializeImmutableOwner>

export type IncompleteEvent<T> = Omit<T, 'mint' | 'toOwner' | 'owner'> & {
  mint?: string
  toOwner?: string
  owner?: string
}

// @TODO: Approve | Revoke | InitializeMultisig | FreezeAccount | SetAuthority

export type SPLTokenEventPublic = SPLTokenEvent & { tokenInfo: TokenInfo }

// ----------------------------- HOLDINGS -----------------------------------

export type SPLTokenBalance = {
  blockchain: BlockchainId
  slot: number
  timestamp: number
  account: string
  mint: string
  owner?: string
  balance: string
}

// ------------------------

export type MintEventsFilters = {
  account?: string
  startDate?: number
  endDate?: number
  types?: string[]
  limit?: number
  reverse?: boolean
  skip?: number
}

export type AccountEventsFilters = {
  startDate?: number
  endDate?: number
  types?: string[]
  limit?: number
  reverse?: boolean
  skip?: number
}

export type AccountHoldingsOptions = {
  startDate?: number
  endDate?: number
  reverse?: boolean
  limit?: number
  skip?: number
}

export type SPLTokenTrackAccount = {
  blockchain: BlockchainId
  account: string
  mint: string
}

// -------------------------

export type SPLTokenEventQueryArgs = CommonEventQueryArgs

// ------------------------

export type SPLTokenBalanceQueryArgs = CommonBalanceQueryArgs
