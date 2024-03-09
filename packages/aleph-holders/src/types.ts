import { BlockchainId } from '@aleph-indexer/framework'
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
  Transfer = 'transfer',
  TransferChecked = 'transferChecked',
  Burn = 'burn',
  BurnChecked = 'burnChecked',
  MintTo = 'mintTo',
  MintToChecked = 'mintToChecked',
  InitializeAccount = 'initializeAccount',
  InitializeAccount2 = 'initializeAccount2',
  InitializeAccount3 = 'initializeAccount3',
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

export type SLPTokenRawEvent =
  | SPLTokenRawEventMintTo
  | SPLTokenRawEventMintToChecked
  | SPLTokenRawEventBurn
  | SPLTokenRawEventBurnChecked
  | SPLTokenRawEventTransfer
  | SPLTokenRawEventTransferChecked
  | SPLTokenRawEventInitializeAccount
  | SPLTokenRawEventInitializeAccount2
  | SPLTokenRawEventInitializeAccount3
