import {
  SolanaParsedInnerInstruction,
  AlephParsedParsedInstruction,
  SolanaParsedInstruction,
  SolanaRawInstruction,
} from '@aleph-indexer/solana'
import {
  MPLTokenBalance,
  MPLTokenEvent,
  SLPTokenInstruction,
} from '../types/solana.js'
import { METAPLEX_CORE_PROGRAM_ID } from './constants.js'

export function getAssetAccountsFromEvent(
  event: MPLTokenEvent | MPLTokenBalance,
): string[] {
  return [event.asset]
}

export function getOwnerAccountsFromEvent(
  event: MPLTokenEvent | MPLTokenBalance,
): string[] {
  return event.owner ? [event.owner] : []
}

export function getAllIndexableAccountsFromEvent(
  event: MPLTokenEvent | MPLTokenBalance,
): string[] {
  return [
    ...getAssetAccountsFromEvent(event),
    ...getOwnerAccountsFromEvent(event),
  ]
}

// ----------------------

function isMPLTokenInstruction(
  instruction:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): instruction is SLPTokenInstruction {
  return instruction.programId === METAPLEX_CORE_PROGRAM_ID
}

function isParsedIx(
  instruction:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): instruction is AlephParsedParsedInstruction {
  return 'parsed' in instruction
}

export function isMPLTokenParsedInstruction(
  instruction:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): instruction is SLPTokenInstruction {
  return isParsedIx(instruction) && isMPLTokenInstruction(instruction)
}

// -----------------------------
