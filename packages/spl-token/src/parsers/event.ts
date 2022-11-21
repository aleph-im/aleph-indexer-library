import { InstructionContextV1, Utils } from '@aleph-indexer/core'
import { SLPTokenRawEvent, SPLTokenEvent, SPLTokenEventType } from '../types.js'

const { getTokenBalance } = Utils

export class EventParser {
  parse(ixCtx: InstructionContextV1): SPLTokenEvent | undefined {
    const { ix, parentIx, txContext } = ixCtx
    const { tx: parentTx } = txContext

    const parsed = (ix as SLPTokenRawEvent).parsed

    const id = `${parentTx.signature}${
      parentIx ? `:${parentIx.index.toString().padStart(2, '0')}` : ''
    }:${ix.index.toString().padStart(2, '0')}`

    const timestamp = parentTx.blockTime
      ? parentTx.blockTime * 1000
      : parentTx.slot
    const type = parsed.type

    switch (type) {
      case SPLTokenEventType.MintTo: {
        const account = parsed.info.account
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type,
          amount: parsed.info.amount,
          balance,
          account,
          mint: '',
          owner: '',
        }
      }
      case SPLTokenEventType.MintToChecked: {
        const { account, tokenAmount } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type: SPLTokenEventType.MintTo,
          amount: tokenAmount.amount,
          balance,
          account,
          mint: '',
          owner: '',
        }
      }
      case SPLTokenEventType.Burn: {
        const { account, amount } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type,
          amount,
          balance,
          account,
          mint: '',
          owner: '',
        }
      }
      case SPLTokenEventType.BurnChecked: {
        const { account, tokenAmount } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type: SPLTokenEventType.Burn,
          amount: tokenAmount.amount,
          balance,
          account,
          mint: '',
          owner: '',
        }
      }
      case SPLTokenEventType.InitializeAccount:
      case SPLTokenEventType.InitializeAccount2:
      case SPLTokenEventType.InitializeAccount3: {
        const { account, owner, mint } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type: SPLTokenEventType.InitializeAccount,
          balance,
          account,
          mint,
          owner,
        }
      }
      case SPLTokenEventType.CloseAccount: {
        const { account, destination } = parsed.info
        const owner =
          'owner' in parsed.info ? parsed.info.owner : parsed.info.multisigOwner

        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type,
          balance,
          account,
          mint: '',
          owner,
          toAccount: destination,
        }
      }
      case SPLTokenEventType.Transfer: {
        const account = parsed.info.source
        const balance = getTokenBalance(parentTx, account) as string

        const toAccount = parsed.info.destination
        const toBalance = getTokenBalance(parentTx, toAccount) as string

        const owner =
          'authority' in parsed.info
            ? parsed.info.authority
            : parsed.info.multisigAuthority

        return {
          id,
          timestamp,
          type,
          amount: parsed.info.amount,
          balance,
          account,
          owner,
          toBalance,
          toAccount,
          toOwner: '',
          mint: '',
        }
      }
      case SPLTokenEventType.TransferChecked: {
        const account = parsed.info.source
        const balance = getTokenBalance(parentTx, account) as string

        const toAccount = parsed.info.destination
        const toBalance = getTokenBalance(parentTx, toAccount) as string

        return {
          id,
          timestamp,
          type: SPLTokenEventType.Transfer,
          amount: parsed.info.tokenAmount.amount,
          balance,
          account,
          owner: parsed.info.authority,
          toBalance,
          toAccount,
          toOwner: '',
          mint: '',
        }
      }
      case SPLTokenEventType.SetAuthority: {
        const { account, authority, authorityType, newAuthority } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type,
          balance,
          account,
          owner: '',
          newOwner: newAuthority,
          authorityType,
          mint: '',
        }
      }
      case SPLTokenEventType.Approve: {
        const { source: account, owner, delegate, amount } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type,
          amount,
          balance,
          account,
          owner,
          delegate,
          mint: '',
        }
      }
      case SPLTokenEventType.ApproveChecked: {
        const { source: account, owner, delegate, tokenAmount } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type: SPLTokenEventType.Approve,
          amount: tokenAmount.amount,
          balance,
          account,
          owner,
          delegate,
          mint: '',
        }
      }
      case SPLTokenEventType.Revoke: {
        const { source: account, owner } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type,
          balance,
          account,
          owner,
          mint: '',
        }
      }
      case SPLTokenEventType.SyncNative: {
        const { account } = parsed.info
        const balance = getTokenBalance(parentTx, account) as string

        return {
          id,
          timestamp,
          type,
          balance,
          account,
          owner: '',
          mint: '',
        }
      }

      default: {
        console.log('NOT PARSED IX TYPE', (parsed as any).type)
        console.log(id)
        return
      }
    }
  }
}

export const eventParser = new EventParser()
export default eventParser
