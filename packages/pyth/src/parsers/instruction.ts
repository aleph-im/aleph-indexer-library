import {
  AlephParsedInstruction,
  AlephParsedParsedInstruction,
  InstructionParser,
  PARSERS as _PARSERS,
  Parsers,
  RawInstruction,
} from '@aleph-indexer/core'
import { ProgramName, PYTH_PROGRAM_ID } from '../constants.js'
import {
  getPythEventType,
  IX_ACCOUNTS_LAYOUT,
  IX_DATA_LAYOUT,
} from '../layouts/instructions.js'
import { PythEventType } from '../types.js'

export const PARSERS = _PARSERS

export class BeetInstructionParser<
  EventTypeEnum extends string,
> extends InstructionParser<EventTypeEnum> {
  parse(
    rawIx: RawInstruction | AlephParsedInstruction,
  ): RawInstruction | AlephParsedInstruction {
    if (!this.isCompatibleInstruction(rawIx)) return rawIx

    const decoded = this.getInstructionData(rawIx)
    if (!decoded) return rawIx

    const type = this.getInstructionType(decoded)
    if (!type) return rawIx

    const parsedIx: AlephParsedParsedInstruction = rawIx as any
    parsedIx.program = this.programName

    parsedIx.parsed = {
      type,
      info: {
        ...(rawIx as any).parsed?.info,
        data: {
          ...this.parseInstructionData(type, decoded),
        },
        accounts: {
          ...this.parseInstructionAccounts(type, parsedIx),
        },
      },
    }

    return parsedIx
  }

  protected parseInstructionData(type: EventTypeEnum, data: Buffer): any {
    try {
      const template = this.dataLayouts[type]
      if (!template) return {}

      return this.dataLayouts[type].deserialize(data)
    } catch (e) {
      console.error(e)
    }
  }
}

export function initParsers(): void {
  const PROGRAMS = PARSERS['PROGRAMS'] as Parsers
  PROGRAMS[PYTH_PROGRAM_ID] = new BeetInstructionParser<PythEventType>(
    PYTH_PROGRAM_ID,
    ProgramName.Pyth,
    PARSERS,
    getPythEventType,
    IX_ACCOUNTS_LAYOUT,
    IX_DATA_LAYOUT,
  )
}
