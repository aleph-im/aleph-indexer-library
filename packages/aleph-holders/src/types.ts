import { BlockchainId } from '@aleph-indexer/framework'
import { TokenInfo } from '@solana/spl-token-registry'
import BN from 'bn.js'

export type AlephEvent = {
  blockchain: BlockchainId
  id: string
  timestamp: number
  height: number
  transaction: string
}

export type TransferEvent = AlephEvent & {
  from: string
  to: string
  value: string // uint256 hex
  valueNum?: number
  valueBN?: BN
}

export type Balance = {
  blockchain: BlockchainId
  account: string
  balance: string // uint256 hex
  balanceNum?: number
  balanceBN?: BN
}

export enum EventType {
  Transfer = 'Transfer(address,address,uint256)',
}

export type TransferEventQueryArgs = {
  blockchain: BlockchainId
  account?: string
  startDate?: number
  endDate?: number
  startHeight?: number
  endHeight?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type BalanceQueryArgs = {
  blockchain: BlockchainId
  account?: string
  limit?: number
  skip?: number
  reverse?: boolean
}

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

export type SPLTokenRawInfoTransfer = {
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

export type SPLTokenRawEventTransfer = SPLTokenRawEventBase & {
  parsed: {
    info: SPLTokenRawInfoTransfer
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

export type SPLTokenRawEventInitializeAccountInfo = {
  account: string
  mint: string
  owner: string
  rentSysvar: string
}

export type SPLTokenRawEventInitializeAccountBase<T> = SPLTokenRawEventBase & {
  parsed: {
    info: SPLTokenRawEventInitializeAccountInfo
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

export type SPLTokenRawInfoApprove = {
  amount: string
  delegate: string
  owner: string
  source: string
}

export type SPLTokenRawEventApprove = SPLTokenRawEventBase & {
  parsed: {
    info: SPLTokenRawInfoApprove
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

export type SPLTokenRawInfoRevoke = {
  owner: string
  source: string
}

export type SPLTokenRawEventRevoke = SPLTokenRawEventBase & {
  parsed: {
    info: SPLTokenRawInfoRevoke
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

export type SPLTokenRawEvent =
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

export type SPLTokenInfo = {
  name: string
  address: string
  programId: string
  tokenInfo: TokenInfo
}

export type SPLTokenEventBase = {
  id: string
  timestamp: number
  height: number
  transaction: string
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

export type SPLTokenIncompleteEvent =
  | IncompleteEvent<SPLTokenEventApprove>
  | IncompleteEvent<SPLTokenEventRevoke>
  | IncompleteEvent<SPLTokenEventMint>
  | IncompleteEvent<SPLTokenEventBurn>
  | IncompleteEvent<SPLTokenEventInitializeAccount>
  | IncompleteEvent<SPLTokenEventCloseAccount>
  | IncompleteEvent<SPLTokenEventTransfer>

export type SPLTokenEvent =
  | SPLTokenEventApprove
  | SPLTokenEventRevoke
  | SPLTokenEventMint
  | SPLTokenEventBurn
  | SPLTokenEventInitializeAccount
  | SPLTokenEventCloseAccount
  | SPLTokenEventTransfer

export type IncompleteEvent<T> = Omit<T, 'mint' | 'toOwner' | 'owner'> & {
  mint?: string
  toOwner?: string
  owner?: string
}
