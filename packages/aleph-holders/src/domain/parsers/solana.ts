import {
  SolanaParsedInstructionContext,
  getTokenBalance,
} from '@aleph-indexer/solana'
import {
  SPLTokenEvent,
  SPLTokenEventType,
  SPLTokenRawEvent,
} from '../../types.js'
import {
  IndexTokenAccount,
} from '../../dal/fetchTokenAccount.js'

export type MintOwner = {
  mint: string
  owner: string
}

export type TokenAccountWork = {
  id: string
  time: number
  payload: IndexTokenAccount
}

export class SolanaEventParser {
  constructor() {}

  async parseEvent(
    ixCtx: SolanaParsedInstructionContext,
    alephMint: string,
  ): Promise<SPLTokenEvent | undefined> {
    const { instruction, parentInstruction, parentTransaction } = ixCtx
    const parsed = (instruction as SPLTokenRawEvent).parsed

    const id = `${parentTransaction.signature}${
      parentInstruction
        ? `:${parentInstruction.index.toString().padStart(2, '0')}`
        : ''
    }:${instruction.index.toString().padStart(2, '0')}`

    const timestamp = parentTransaction.blockTime
      ? parentTransaction.blockTime * 1000
      : parentTransaction.slot
    const type = parsed.type
    const eventBase = {
      id,
      timestamp,
      height: parentTransaction.slot,
      transaction: parentTransaction.signature,
    }

    switch (type) {
      case SPLTokenEventType.MintTo: {
        const account = parsed.info.account
        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type,
          amount: parsed.info.amount,
          balance,
          account,
          mint: parsed.info.mint,
        }
      }
      case SPLTokenEventType.MintToChecked: {
        const { account, tokenAmount } = parsed.info
        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type: SPLTokenEventType.MintTo,
          amount: tokenAmount.amount,
          balance,
          account,
          mint: parsed.info.mint,
        }
      }
      case SPLTokenEventType.ApproveChecked: {
        const {
          source: account,
          tokenAmount: { amount },
          delegate,
        } = parsed.info
        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type: SPLTokenEventType.Approve,
          amount,
          balance,
          account,
          delegate,
          mint: parsed.info.mint,
        }
      }
      case SPLTokenEventType.Approve: {
        const { source: account, amount, delegate } = parsed.info
        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type,
          amount,
          balance,
          account,
          delegate,
          // note: validated before
          mint: alephMint,
        }
      }
      case SPLTokenEventType.Revoke: {
        const { source: account, owner } = parsed.info
        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type,
          balance,
          account,
          owner,
          // note: validated before
          mint: alephMint,
        }
      }
      case SPLTokenEventType.Burn: {
        const { account, amount } = parsed.info
        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type,
          amount,
          balance,
          account,
          mint: parsed.info.mint,
        }
      }
      case SPLTokenEventType.BurnChecked: {
        const { account, tokenAmount } = parsed.info
        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type: SPLTokenEventType.Burn,
          amount: tokenAmount.amount,
          balance,
          account,
          mint: parsed.info.mint,
        }
      }
      case SPLTokenEventType.InitializeAccount:
      case SPLTokenEventType.InitializeAccount2:
      case SPLTokenEventType.InitializeAccount3: {
        return {
          ...eventBase,
          type: SPLTokenEventType.InitializeAccount,
          balance: '0',
          account: parsed.info.account,
          owner: parsed.info.owner,
          mint: parsed.info.mint,
        }
      }
      
      case SPLTokenEventType.CloseAccount: {
        const { account, destination } = parsed.info

        const owner =
          'owner' in parsed.info ? parsed.info.owner : parsed.info.multisigOwner

        const balance = getTokenBalance(parentTransaction, account) as string

        return {
          ...eventBase,
          type,
          balance,
          account,
          mint: alephMint,
          owner,
          toAccount: destination,
        }
      }
      case SPLTokenEventType.Transfer: {
        const account = parsed.info.source
        const balance = getTokenBalance(parentTransaction, account) as string

        const toAccount = parsed.info.destination
        const toBalance = getTokenBalance(
          parentTransaction,
          toAccount,
        ) as string

        const owner =
          'authority' in parsed.info
            ? parsed.info.authority
            : parsed.info.multisigAuthority

        return {
          ...eventBase,
          type,
          amount: parsed.info.amount,
          balance,
          account,
          owner,
          toBalance,
          toAccount,
          // note: validated before
          mint: alephMint,
        }
      }
      case SPLTokenEventType.TransferChecked: {
        const account = parsed.info.source
        const balance = getTokenBalance(parentTransaction, account) as string

        const toAccount = parsed.info.destination
        const toBalance = getTokenBalance(
          parentTransaction,
          toAccount,
        ) as string

        return {
          ...eventBase,
          type: SPLTokenEventType.Transfer,
          amount: parsed.info.tokenAmount.amount,
          balance,
          account,
          owner: parsed.info.authority,
          toBalance,
          toAccount,
          mint: parsed.info.mint,
        }
      }

      default: {
        console.log('event not parsed', ixCtx)
        return
      }
    }
  }
}
