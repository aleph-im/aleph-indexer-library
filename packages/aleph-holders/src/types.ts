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

export type SPLTokenRawInfoBurn = {
  account: string
  amount: string
  authority: string
  mint: string
}

export type SPLTokenRawEventBurn = SPLTokenRawEventBase & {
  parsed: {
    info: SPLTokenRawInfoBurn
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

export type SPLTokenRawInfoApprove = {
  amount: string
  delegate: string
  owner: string
  source: string
}

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

export type TokenAccountInfo = {
  address: string
  owner: string
  balance: string
}

export type SPLTokenEvent = AlephEvent & {
  type: SPLTokenEventType
  to: string
  from: string
  amount: string
}