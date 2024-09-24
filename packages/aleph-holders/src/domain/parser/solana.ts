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
import { bigNumberToUint256 } from '../../utils/numbers.js'
import BN from 'bn.js'

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
    const { blockchain, height, mint, owner, timestamp } = event
    const accounts = getAccountsFromEvent(event)

    return accounts.map((account) => {
      const balance = getBalanceFromEvent(event, account) || '0'

      return {
        blockchain,
        height,
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
    const height = this.parseSlot(ixCtx)
    const index = this.parseIndex(ixCtx)
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
      height,
      index,
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
        const { account, owner } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        console.log('---> init account => ', account, baseEvent.id)

        return {
          ...baseEvent,
          type: SPLTokenEventType.InitializeAccount,
          account,
          balance,
          owner,
        }
      }

      case SPLTokenEventType.InitializeMint:
      case SPLTokenEventType.InitializeMint2: {
        const { mint, mintAuthority } = parsed.info
        const account = mint
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.InitializeMint,
          account,
          balance,
          owner: mintAuthority,
        }
      }

      case SPLTokenEventType.MintTo: {
        const { account, amount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.MintTo,
          amount,
          account,
          balance,
        }
      }

      case SPLTokenEventType.MintToChecked: {
        const {
          account,
          tokenAmount: { amount },
        } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.MintTo,
          amount,
          account,
          balance,
        }
      }

      case SPLTokenEventType.Burn: {
        const { account, amount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Burn,
          amount,
          account,
          balance,
        }
      }

      case SPLTokenEventType.BurnChecked: {
        const {
          account,
          tokenAmount: { amount },
        } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Burn,
          amount,
          account,
          balance,
        }
      }

      case SPLTokenEventType.CloseAccount: {
        const { account, destination: toAccount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)
        const toBalance = this.getTokenBalance(parentTransaction, toAccount)
        const owner =
          'owner' in parsed.info ? parsed.info.owner : parsed.info.multisigOwner

        return {
          ...baseEvent,
          type: SPLTokenEventType.CloseAccount,
          account,
          balance,
          toAccount,
          toBalance,
          owner,
          // toOwner,
        }
      }

      case SPLTokenEventType.Transfer: {
        const { source: account, destination: toAccount, amount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)
        const toBalance = this.getTokenBalance(parentTransaction, toAccount)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Transfer,
          amount,
          account,
          balance,
          toAccount,
          toBalance,
          // owner,
          // toOwner,
        }
      }

      case SPLTokenEventType.TransferChecked: {
        const {
          source: account,
          destination: toAccount,
          tokenAmount: { amount },
        } = parsed.info

        const balance = this.getTokenBalance(parentTransaction, account)
        const toBalance = this.getTokenBalance(parentTransaction, toAccount)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Transfer,
          amount,
          account,
          balance,
          toBalance,
          toAccount,
          // owner,
          // toOwner,
        }
      }

      case SPLTokenEventType.SetAuthority: {
        const {
          account,
          authority: owner,
          authorityType,
          newAuthority: newOwner,
        } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.SetAuthority,
          authorityType,
          owner,
          newOwner,
          account,
          balance,
        }
      }

      case SPLTokenEventType.Approve: {
        const { source: account, owner, delegate, amount } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Approve,
          amount,
          account,
          balance,
          owner,
          delegate,
        }
      }

      case SPLTokenEventType.ApproveChecked: {
        const {
          source: account,
          owner,
          delegate,
          tokenAmount: { amount },
        } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.Approve,
          amount,
          account,
          balance,
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
          account,
          balance,
          owner,
        }
      }

      case SPLTokenEventType.SyncNative: {
        const { account } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.SyncNative,
          account,
          balance,
          // owner,
        }
      }

      case SPLTokenEventType.InitializeImmutableOwner: {
        const { account } = parsed.info
        const balance = this.getTokenBalance(parentTransaction, account)

        return {
          ...baseEvent,
          type: SPLTokenEventType.InitializeImmutableOwner,
          account,
          balance,
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
        ? `_${parentInstruction.index.toString().padStart(2, '0')}`
        : ''
    }_${instruction.index.toString().padStart(2, '0')}`
  }

  protected parseIndex(ixCtx: SolanaParsedInstructionContext): number {
    const { instruction, parentInstruction } = ixCtx
    return (parentInstruction?.index || 0) * 100 + instruction.index
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
  ): string {
    const balanceIndex = tx.parsed.message.accountKeys.findIndex(
      ({ pubkey }) => pubkey === address,
    )

    const balanceInfo = tx.meta?.postTokenBalances?.find(
      ({ accountIndex }) => accountIndex === balanceIndex,
    )

    const balanceDec = balanceInfo?.uiTokenAmount.amount || '0'
    const balanceDecBN = new BN(balanceDec)
    return bigNumberToUint256(balanceDecBN)
  }
}
