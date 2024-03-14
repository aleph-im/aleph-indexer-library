import {
  AlephParsedInstruction,
  AlephParsedInnerInstruction,
  AlephParsedParsedInstruction,
  TOKEN_PROGRAM_ID,
  RawParsedInstruction,
} from '@aleph-indexer/solana'
import {
  SPLTokenRawEvent,
  SPLTokenEvent,
  SPLTokenEventType,
  SPLTokenIncompleteEvent,
} from '../types.js'
import { blockchainDeployerAccount } from './constants.js'
import { BlockchainChain } from '@aleph-indexer/framework'

export function isTokenMovement(type: SPLTokenEventType) {
  return [
    SPLTokenEventType.Transfer,
    SPLTokenEventType.MintTo,
    SPLTokenEventType.Approve,
    SPLTokenEventType.Revoke,
  ].includes(type)
}

export function isSPLTokenInstruction(
  ix:
    | RawParsedInstruction
    | AlephParsedInstruction
    | AlephParsedInnerInstruction,
): ix is SPLTokenRawEvent {
  return ix.programId === TOKEN_PROGRAM_ID
}

export function isParsedIx(
  ix:
    | RawParsedInstruction
    | AlephParsedInstruction
    | AlephParsedInnerInstruction,
): ix is AlephParsedParsedInstruction {
  return 'parsed' in ix
}

export function isSPLTokenParsedInstruction(
  ix:
    | RawParsedInstruction
    | AlephParsedInstruction
    | AlephParsedInnerInstruction,
): ix is SPLTokenRawEvent {
  if (!isParsedIx(ix) || !isSPLTokenInstruction(ix)) return false
  return true
}

export function getEventAccounts(event: SPLTokenIncompleteEvent): string[] {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount) {
        return [event.account, event.toAccount]
      } else {
        return [event.account]
      }
    }
    case SPLTokenEventType.MintTo: {
      return [blockchainDeployerAccount[BlockchainChain.Solana], event.account]
    }
    case SPLTokenEventType.Approve: {
      // note: wormhole token bridge authority, to get total tokens on solana this ix is computed on blockchainDeployerAccount not in the token account
      // https://solana.fm/tx/5VoTAZJRzwktGBNiE2XS6bQBtG94QK2aeBEKK1oRtpR86BmwMQNUnaetBght9WEDW14BbsqpZfNbrEhF58aFkBH5?cluster=mainnet-alpha
      const delegate =
        event.delegate === '7oPa2PHQdZmjSPqvpZN7MQxnC7Dcf3uL4oLqknGLk2S3'
          ? blockchainDeployerAccount[BlockchainChain.Solana]
          : event.delegate

      return [event.account, delegate]
    }
    case SPLTokenEventType.Revoke: {
      // note: previous degelate could be different
      return [blockchainDeployerAccount[BlockchainChain.Solana], event.account]
    }
    default: {
      return [event.account]
    }
  }
}

export function getBalanceFromEvent(
  event: SPLTokenIncompleteEvent,
  account: string,
): string {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount === account) {
        return event.toBalance as string
      } else {
        return event.balance
      }
    }
    default: {
      return event.balance
    }
  }
}

export function getMintAndOwnerFromEvent(
  event: SPLTokenEvent,
  account: string,
): { mint: string; owner?: string } {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount === account) {
        return { mint: event.mint, owner: event.toOwner }
      } else {
        return { mint: event.mint, owner: event.owner }
      }
    }
    default: {
      return { mint: event.mint, owner: event.owner }
    }
  }
}
