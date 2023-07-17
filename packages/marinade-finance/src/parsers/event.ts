import {
  SolanaParsedInstructionContext,
  RawMessageAccount,
} from '@aleph-indexer/solana'
import {
  MarinadeFinanceEvent,
  RawInstruction,
  RawInstructionsInfo,
} from '../utils/layouts/index.js'

export class EventParser {
  parse(
    ixCtx: SolanaParsedInstructionContext,
    account: string,
  ): MarinadeFinanceEvent {
    const { instruction, parentInstruction, parentTransaction } = ixCtx
    const parsed = (instruction as RawInstruction).parsed

    const id = `${parentTransaction.signature}${
      parentInstruction
        ? ` :${parentInstruction.index.toString().padStart(2, '0')}`
        : ''
    }:${instruction.index.toString().padStart(2, '0')}`

    const timestamp = parentTransaction.blockTime
      ? parentTransaction.blockTime * 1000
      : parentTransaction.slot

    const signer = parentTransaction.parsed.message.accountKeys.find(
      (acc: RawMessageAccount) => acc.signer,
    )?.pubkey

    return {
      id,
      timestamp,
      type: parsed.type,
      signer: signer,
      info: parsed.info as RawInstructionsInfo,
      account: account,
    } as MarinadeFinanceEvent
  }
}

export const eventParser = new EventParser()
export default eventParser
