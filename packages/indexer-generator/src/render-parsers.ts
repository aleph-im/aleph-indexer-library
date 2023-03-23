import { ViewInstructions } from './types.js'

export function renderParsersFiles(
  instructions: ViewInstructions | undefined,
): string[] {
  let event = `import {
  SolanaParsedInstructionContext,
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
  parse(
    ixCtx: SolanaParsedInstructionContext,
    ctx: { account: string; startDate: number; endDate: number },
  ): ParsedEvents {
    const { instruction, parentInstruction, parentTransaction } = ixCtx
    const parsed = (
      instruction as SolanaParsedEvent<InstructionType, ParsedEventsInfo>
    ).parsed

    const id = \`\${parentTransaction.signature}\${
    parentInstruction
      ? \` :\${parentInstruction.index.toString().padStart(2, '0')}\`
      : ''
  }:\${instruction.index.toString().padStart(2, '0')}\`

    const timestamp = parentTransaction.blockTime
      ? parentTransaction.blockTime * 1000
      : parentTransaction.slot

    const baseEvent = {
      ...parsed.info,
      id,
      timestamp,
      type: parsed.type,
      account: ctx.account,
      signer: parentTransaction.parsed.message.accountKeys[0].pubkey,
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
  const eventTest = `import {jest} from "@jest/globals";

jest.setTimeout(10000)

import { EventParser } from "../event.js";
import { InstructionContextV1 } from "@aleph-indexer/core"


// test correct event parsing
describe('EventParser', () => {
  it('parses the first event in the IDL from InstructionContext', () => {
    const instruction = {
      index: 0,
      parsed: {
        type: "${instructions?.instructions[0].name}Event",
        info: {
          programId: "programId",
        }
      },
      programId: "programId",
      signer: '2gCzKgSTPSy4fL7z9NQhJAKvumEofTa2DFJU4wGhQ5Jt',
      innerInstructions: [],
      data: "data",
      accounts: [],
    }
    const accountKeys = [
      {
        pubkey: '2gCzKgSTPSy4fL7z9NQhJAKvumEofTa2DFJU4wGhQ5Jt',
        signer: true,
        writable: true,
      },
    ]
    const instructionContext: InstructionContextV1 = {
      ix: instruction,
      parentIx: undefined,
      txContext: {
        tx: {
          signature: "signature",
          blocktime: 0,
          slot: 0,
          index: 0,
          meta: {
            err: null,
            fee: 0,
            innerInstructions: [],
            preBalances: [],
            postBalances: [],
          },
          parsed: {
            error: undefined,
            message: {
              instructions: [instruction],
              accountKeys: accountKeys,
              recentBlockhash: "recentBlockhash",
            },
            signatures: [],
          }
        },
        parserContext: {
          account: "account",
          startDate: 0,
          endDate: 0,
        }
      }
    }
    const eventParser = new EventParser()
    const parsedEvent = eventParser.parse(instructionContext)
    console.log(parsedEvent)
    expect(parsedEvent).toEqual({
      id: "signature:00",
      timestamp: 0,
      type: "${instructions?.instructions[0].name}Event",
      account: "account",
      programId: "programId",
      signer: '2gCzKgSTPSy4fL7z9NQhJAKvumEofTa2DFJU4wGhQ5Jt',
    })
  })
})`

  return [event, eventTest]
}
