import {
  SolanaParsedInstructionContext,
  getTokenBalance,
  solanaPrivateRPC,
} from '@aleph-indexer/solana'
import {
  SPLTokenEvent,
  SPLTokenEventInitializeAccount,
  SPLTokenEventType,
  SPLTokenRawEvent,
  SPLTokenRawInfoTransfer,
  SPLTokenRawInfoApprove,
  SPLTokenRawInfoRevoke,
} from '../../types.js'
import { PublicKey } from '@solana/web3.js'
import { EventDALIndex, EventStorage } from '../../dal/solanaEvents.js'
import {
  FetchTokenAccountStorage,
  IndexTokenAccount,
} from '../../dal/fetchTokenAccount.js'
import { TokenAccountStorage } from '../../dal/tokenAccount.js'
import { PendingWorkPool } from '@aleph-indexer/core'
import { AccountLayout, getAssociatedTokenAddressSync } from '@solana/spl-token'

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
  constructor(
    protected fetchTokenAccountDAL: FetchTokenAccountStorage,
    protected tokenAccountDAL: TokenAccountStorage,
    protected eventDAL: EventStorage,
    protected tokenAccounts: PendingWorkPool<IndexTokenAccount>,
  ) {}

  async parseEvent(
    ixCtx: SolanaParsedInstructionContext,
    alephMint: string,
    accountContext: string,
  ): Promise<SPLTokenEvent | undefined> {
    const { instruction, parentInstruction, parentTransaction } = ixCtx
    const parsed = (instruction as SPLTokenRawEvent).parsed

    const validation = await this.validateEvent(
      parsed,
      alephMint,
      accountContext,
    )
    if (!validation) return

    const id = `${parentTransaction.signature}${
      parentInstruction
        ? `:${parentInstruction.index.toString().padStart(2, '0')}`
        : ''
    }:${instruction.index.toString().padStart(2, '0')}`

    const isProcessed = await this.eventDAL.get(id)
    if (isProcessed) return

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
        const balance = getTokenBalance(
          parentTransaction,
          parsed.info.account,
        ) as string
        const event: SPLTokenEventInitializeAccount = {
          ...eventBase,
          type: SPLTokenEventType.InitializeAccount,
          balance,
          account: parsed.info.account,
          owner: parsed.info.owner,
          mint: parsed.info.mint,
        }

        await this.tokenAccountDAL.save({
          address: event.account,
          owner: parsed.info.owner,
        })

        await this.tokenAccounts.addWork({
          id: event.account,
          time: Date.now(),
          payload: {
            account: event.account,
            timestamp: event.timestamp,
            event,
          },
        })

        return event
      }
      /*
      it is needed to validate the mint correctly ie. ata is from mint
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
          mint,
          owner,
          toAccount: destination,
        }
      }*/
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

  protected async validateEvent(
    parsed: any,
    alephMint: string,
    accountContext: string,
  ) {
    const isInitEvent = [
      SPLTokenEventType.InitializeAccount,
      SPLTokenEventType.InitializeAccount2,
      SPLTokenEventType.InitializeAccount3,
      //SPLTokenEventType.CloseAccount,
    ].includes(parsed.type)
    if (isInitEvent && accountContext !== alephMint) return false

    const isTokenMovement = [
      SPLTokenEventType.Transfer,
      SPLTokenEventType.TransferChecked,
      SPLTokenEventType.MintTo,
      SPLTokenEventType.MintToChecked,
      SPLTokenEventType.Burn,
      SPLTokenEventType.BurnChecked,
      SPLTokenEventType.Approve,
      SPLTokenEventType.ApproveChecked,
      SPLTokenEventType.Revoke,
    ].includes(parsed.type)
    if (!isTokenMovement && accountContext === alephMint) return false

    if (parsed.type === SPLTokenEventType.Transfer) {
      return await this.validateTransfer(parsed.info, alephMint)
    }

    if (parsed.type === SPLTokenEventType.Approve) {
      // weird behaviour reading instructions from program: SwY5jQkf6bT6uLE6jWFk9V19nVgTLdX9ECRZtSsydJ2
      // example: https://solana.fm/tx/3dEgFn9SKrPuRztTnsSTGiV61yCvmcU359hZWCrWwz8mo314dJqsCzVju993HfzSC4hjjCeDSoVDVji7frSs8rcc?cluster=mainnet-alpha
      if (parsed.info.amount === '0') return false
      return await this.validateSource(parsed.info, alephMint)
    }

    if (parsed.type === SPLTokenEventType.Revoke) {
      return await this.validateSource(parsed.info, alephMint)
    }

    return parsed.info.mint === alephMint
  }

  protected async validateSource(
    info: SPLTokenRawInfoApprove | SPLTokenRawInfoRevoke,
    alephMint: string,
  ): Promise<boolean> {
    // idk why FTX ata can not be derived
    const FTX_ATA = '341LwarVojT1g5xMgrRYLuQ4G5oxXMSH3uEe88zu1jZ4'
    if (info.source == FTX_ATA) return true

    const expectedAta = getAssociatedTokenAddressSync(
      new PublicKey(alephMint),
      new PublicKey(info.owner),
      true,
    )
    if (expectedAta.toString() === info.source) return true

    const alephPubkey = new PublicKey(alephMint)
    return await this.validateAta(alephPubkey, [info.source])
  }

  protected async validateTransfer(
    info: SPLTokenRawInfoTransfer,
    alephMint: string,
  ): Promise<boolean> {
    const owner = new PublicKey(
      'authority' in info ? info.authority : info.multisigAuthority,
    )

    // idk why FTX ata can not be derived
    const FTX_ATA = '341LwarVojT1g5xMgrRYLuQ4G5oxXMSH3uEe88zu1jZ4'
    if ([info.source, info.destination].includes(FTX_ATA)) return true

    const expectedAta = getAssociatedTokenAddressSync(
      new PublicKey(alephMint),
      owner,
      true,
    )
    if (expectedAta.toString() === info.source) return true

    const alephPubkey = new PublicKey(alephMint)
    return await this.validateAta(alephPubkey, [info.source, info.destination])
  }

  async validateAta(
    alephPubkey: PublicKey,
    accounts: string[],
  ): Promise<boolean> {
    for (const account of accounts) {
      const exists = await this.eventDAL
        .useIndex(EventDALIndex.AccountTimestamp)
        .getFirstItemFromTo([account, 0], [account, Date.now()])
      if (exists) return true

      const connection = solanaPrivateRPC.getConnection()
      const accountInfo = await connection.getAccountInfo(
        new PublicKey(account),
      )
      if (accountInfo?.data) {
        const tokenAccountInfo = AccountLayout.decode(accountInfo.data)
        if (tokenAccountInfo.mint.equals(alephPubkey)) return true
      }
    }
    return false
  }
}
