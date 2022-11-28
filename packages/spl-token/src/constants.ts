import BN from 'bn.js'
import { constants } from '@aleph-indexer/core'
import { SPLTokenEventType } from './types.js'

const { TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID_PK } = constants
export { TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID_PK }

export enum ProgramName {
  SPLToken = 'spl-token',
}

// ----------------- EVENTS --------------------
export const liquidityEvents = [
  SPLTokenEventType.InitializeAccount,
  SPLTokenEventType.CloseAccount,
  SPLTokenEventType.Burn,
]

export const liquidityEventsWhitelist = new Set(liquidityEvents)

export const borrowEvents = [
  SPLTokenEventType.InitializeAccount,
  SPLTokenEventType.CloseAccount,
]

export const borrowEventsWhitelist = new Set(borrowEvents)

export const liquidationEventsWhitelist = new Set([
  SPLTokenEventType.InitializeAccount,
  SPLTokenEventType.Burn,
])

export const flashLoanEventsWhitelist = new Set([
  SPLTokenEventType.InitializeAccount,
])

// WADS

export const usdDecimals = new BN(constants.usdDecimals)
export const usdWad = new BN(
  '1'.concat(Array(usdDecimals.toNumber() + 1).join('0')),
)
export const WAD_DECIMALS = new BN(18)
export const WAD = new BN(
  '1'.concat(Array(WAD_DECIMALS.toNumber() + 1).join('0')),
)
