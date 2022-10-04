import {
  PythEventType,
  UpdatePriceEvent,
  UpdPriceInstruction,
} from '../types.js'

import { InstructionContextV1 } from '@aleph-indexer/framework'
import { AlephParsedEvent } from '@aleph-indexer/core'

export class EventParser {
  parse(ixCtx: InstructionContextV1): UpdatePriceEvent {
    const { ix, parentIx, parentTx } = ixCtx
    const parsed = (ix as AlephParsedEvent<PythEventType, UpdPriceInstruction>)
      .parsed
    const id = `${parentTx.signature}${
      parentIx ? `:${parentIx.index.toString().padStart(2, '0')}` : ''
    }:${ix.index.toString().padStart(2, '0')}`

    const timestamp = parentTx.blockTime
      ? parentTx.blockTime * 1000
      : parentTx.slot
    return {
      id,
      timestamp,
      type: PythEventType.UpdPrice,
      ...parsed.info,
    }
  }
}

export const eventParser = new EventParser()
export default eventParser
