import { ViewInstructions } from './types.js'

export function renderParsersFiles(
  instructions: ViewInstructions | undefined,
): [string, string][] {
  let event = `import {
  SolanaInstructionContext,
  SolanaParsedEvent,
} from '@aleph-indexer/solana'

import {
  ParsedEvents,
  ParsedEventsInfo,
  InstructionType,
  `
  if (instructions != undefined) {
    for (const instruction of instructions.instructions) {
      event += ` ${instruction.name}Event,
`
    }
  }

  event += `
} from '../utils/layouts/index.js'

export class EventParser {
  parse(ixCtx: SolanaInstructionContext): ParsedEvents {
    const { ix, parentIx, txContext } = ixCtx
    const parsed = (ix as SolanaParsedEvent<InstructionType, ParsedEventsInfo>)
      .parsed

    const id = \`\${txContext.tx.signature}\${
      parentIx ? \` :\${parentIx.index.toString().padStart(2, '0')}\` : ''
    }:\${ix.index.toString().padStart(2, '0')}\` 

    const timestamp = txContext.tx.blockTime
    ? txContext.tx.blockTime * 1000
    : txContext.tx.slot

  const baseEvent = {
    ...parsed.info,
    id,
    timestamp,
    type: parsed.type,
    account: txContext.parserContext.account,
    signer: txContext.tx.parsed.message.accountKeys[0].pubkey,
  }

    try {
      switch (parsed.type) {
`

  if (instructions != undefined) {
    for (const instruction of instructions.instructions) {
      event += `       case InstructionType.${instruction.name}:
          return {
            ...baseEvent,
          } as ${instruction.name}Event
`
    }
  }

  event += `

        default: {
          console.log('default -> ', parsed.type, id)
          return baseEvent as ParsedEvents
        }
      }
    } catch (e) {
      console.log('error -> ', parsed.type, id, e)
      throw e
    }
  }
}

export const eventParser = new EventParser()
export default eventParser
`
  return [['event', event]];
}
