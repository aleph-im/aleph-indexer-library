import {
  SolanaParsedInstructionContext,
  SolanaParsedTransaction,
} from '@aleph-indexer/solana'
import { BlockchainId } from '@aleph-indexer/framework'
import { SPLTokenEventStorage } from '../../dal/solana/splTokenEvent.js'
import {
  SLPTokenInstruction,
  SPLTokenBalance,
  SPLTokenEvent,
  SPLTokenEventBase,
  SPLTokenEventType,
} from '../../types/solana.js'
import {
  getAccountsFromEvent,
  getBalanceFromEvent,
  getMintFromInstructionContext,
} from '../../utils/solana.js'

export class SolanaEventParser {
  constructor(protected eventDAL: SPLTokenEventStorage) {}

  async parseBalance(
    blockchain: BlockchainId,
    ixCtx: SolanaParsedInstructionContext,
  ): Promise<SPLTokenBalance[]> {
    const event = await this.parseEvent(blockchain, ixCtx)
    if (!event) return []

    return this.parseBalanceFromEvent(event)
  }

  parseBalanceFromEvent(event: SPLTokenEvent): SPLTokenBalance[] {
    const { blockchain, slot, mint, owner, timestamp } = event
    const accounts = getAccountsFromEvent(event)

    return accounts.map((account) => {
      const balance = getBalanceFromEvent(event, account) || '0'

      return {
        blockchain,
        slot,
        account,
        mint,
        owner,
        balance,
        timestamp,
      }
    })
  }

  protected async parseCommonScheme(
    blockchain: BlockchainId,
    ixCtx: SolanaParsedInstructionContext,
    type: SPLTokenEventType,
  ): Promise<SPLTokenEventBase> {
    const { instruction, parentTransaction } = ixCtx
    const parsed = (instruction as SLPTokenInstruction).parsed

    const id = this.parseId(ixCtx)
    const timestamp = this.parseTimestamp(ixCtx)
    const slot = this.parseSlot(ixCtx)
    const transaction = parentTransaction.signature
    // @note: We filtered by mint previously so mint is always defined
    const mint = (await getMintFromInstructionContext(
      blockchain,
      ixCtx,
      this.eventDAL,
    )) as string

    return {
      id,
      blockchain,
      timestamp,
      type: type || parsed.type,
      height: slot,
      slot,
      mint,
      transaction,
    }
  }

  async parseEvent(
    blockchain: BlockchainId,
    ixCtx: SolanaParsedInstructionContext,
  ): Promise<SPLTokenEvent | undefined> {
    const { instruction, parentTransaction } = ixCtx
    const parsed = (instruction as SLPTokenInstruction).parsed

    const baseEvent = await this.parseCommonScheme(
      blockchain,
      ixCtx,
      parsed.type,
    )

    switch (parsed.type) {
      case SPLTokenEventType.InitializeAccount:
      case SPLTokenEventType.InitializeAccount2:
      case SPLTokenEventType.InitializeAccount3: {
        const { account, owner, mint } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        console.log('---> init account => ', account, baseEvent.id)

        return {
          ...baseEvent,
          type: SPLTokenEventType.InitializeAccount,
          balance,
          account,
          owner,
          mint,
        }
      }

      case SPLTokenEventType.InitializeMint:
      case SPLTokenEventType.InitializeMint2: {
        const { mint, mintAuthority } = parsed.info

        return {
          ...baseEvent,
          type: SPLTokenEventType.InitializeMint,
          owner: mintAuthority,
          mint,
        }
      }

      case SPLTokenEventType.MintTo: {
        const account = parsed.info.account
        const balance = this.getTokenBalance(parentTransaction, account)
        const amount = parsed.info.amount

        return {
          ...baseEvent,
          type: SPLTokenEventType.MintTo,
          amount,
          balance,
          account,
        }
      }

      case SPLTokenEventType.MintToChecked: {
        const { account, tokenAmount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.MintTo,
          amount: tokenAmount.amount,
          balance,
          account,
        }
      }

      case SPLTokenEventType.Burn: {
        const { account, amount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Burn,
          amount,
          balance,
          account,
        }
      }

      case SPLTokenEventType.BurnChecked: {
        const { account, tokenAmount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Burn,
          amount: tokenAmount.amount,
          balance,
          account,
        }
      }

      case SPLTokenEventType.CloseAccount: {
        const { account, destination } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)
        const owner =
          'owner' in parsed.info ? parsed.info.owner : parsed.info.multisigOwner

        return {
          ...baseEvent,
          type: SPLTokenEventType.CloseAccount,
          balance,
          account,
          toAccount: destination,
          owner,
        }
      }

      case SPLTokenEventType.Transfer: {
        const account = parsed.info.source
        const balance = this.getTokenBalance(parentTransaction, account)

        const toAccount = parsed.info.destination
        const toBalance = this.getTokenBalance(parentTransaction, toAccount)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Transfer,
          amount: parsed.info.amount,
          balance,
          account,
          toBalance,
          toAccount,
          // owner,
          // toOwner,
        }
      }

      case SPLTokenEventType.TransferChecked: {
        const account = parsed.info.source
        const balance = this.getTokenBalance(parentTransaction, account)

        const toAccount = parsed.info.destination
        const toBalance = this.getTokenBalance(parentTransaction, toAccount)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Transfer,
          amount: parsed.info.tokenAmount.amount,
          balance,
          account,
          toBalance,
          toAccount,
          // owner,
          // toOwner,
        }
      }

      case SPLTokenEventType.SetAuthority: {
        const { account, authority, authorityType, newAuthority } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.SetAuthority,
          balance,
          account,
          authorityType,
          owner: authority,
          newOwner: newAuthority,
        }
      }

      case SPLTokenEventType.Approve: {
        const { source: account, owner, delegate, amount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Approve,
          amount,
          balance,
          account,
          owner,
          delegate,
        }
      }

      case SPLTokenEventType.ApproveChecked: {
        const { source: account, owner, delegate, tokenAmount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Approve,
          amount: tokenAmount.amount,
          balance,
          account,
          owner,
          delegate,
        }
      }

      case SPLTokenEventType.Revoke: {
        const { source: account, owner } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Revoke,
          balance,
          account,
          owner,
        }
      }

      case SPLTokenEventType.SyncNative: {
        const { account } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.SyncNative,
          balance,
          account,
          // owner,
        }
      }

      case SPLTokenEventType.InitializeImmutableOwner: {
        const { account } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.InitializeImmutableOwner,
          balance,
          account,
          // owner,
        }
      }

      default: {
        console.log('NOT PARSED IX TYPE', (parsed as any).type)
        console.log(baseEvent.id)
        return
      }
    }
  }

  protected parseId(ixCtx: SolanaParsedInstructionContext): string {
    const { instruction, parentInstruction, parentTransaction } = ixCtx

    return `${parentTransaction.signature}${
      parentInstruction
        ? `:${parentInstruction.index.toString().padStart(2, '0')}`
        : ''
    }:${instruction.index.toString().padStart(2, '0')}`
  }

  protected parseTimestamp(ixCtx: SolanaParsedInstructionContext): number {
    const { parentTransaction } = ixCtx

    return parentTransaction.blockTime
      ? parentTransaction.blockTime * 1000
      : parentTransaction.slot
  }

  protected parseSlot(ixCtx: SolanaParsedInstructionContext): number {
    const { parentTransaction } = ixCtx
    return parentTransaction.slot
  }

  protected getTokenBalance(
    tx: SolanaParsedTransaction,
    address: string,
  ): string | undefined {
    const balanceIndex = tx.parsed.message.accountKeys.findIndex(
      ({ pubkey }) => pubkey === address,
    )

    const balanceInfo = tx.meta?.postTokenBalances?.find(
      ({ accountIndex }) => accountIndex === balanceIndex,
    )

    return balanceInfo?.uiTokenAmount.amount
  }
}
