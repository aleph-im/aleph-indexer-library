import BN from 'bn.js'
import { constants } from '@aleph-indexer/core'
import { LendingEventType } from './types.js'

const { TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID_PK } = constants
export { TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID_PK }

// ----------------- EVENTS --------------------
export const liquidityEvents = [
  LendingEventType.DepositReserveLiquidity,
  LendingEventType.RedeemReserveCollateral,
  LendingEventType.BorrowObligationLiquidity,
  LendingEventType.RepayObligationLiquidity,
  LendingEventType.LiquidateObligation,
  LendingEventType.DepositReserveLiquidityAndObligationCollateral,
  LendingEventType.WithdrawObligationCollateralAndRedeemReserveCollateral,
  LendingEventType.LiquidateObligation2,
]

export const liquidityEventsWhitelist = new Set(liquidityEvents)

export const borrowEvents = [
  LendingEventType.BorrowObligationLiquidity,
  LendingEventType.RepayObligationLiquidity,
  LendingEventType.LiquidateObligation,
  LendingEventType.LiquidateObligation2,
]

export const borrowEventsWhitelist = new Set(borrowEvents)

export const liquidationEventsWhitelist = new Set([
  LendingEventType.LiquidateObligation,
  LendingEventType.LiquidateObligation2,
])

export const flashLoanEventsWhitelist = new Set([LendingEventType.FlashLoan])

// WADS

export const usdDecimals = new BN(constants.usdDecimals)
export const usdWad = new BN(
  '1'.concat(Array(usdDecimals.toNumber() + 1).join('0')),
)
export const WAD_DECIMALS = new BN(18)
export const WAD = new BN(
  '1'.concat(Array(WAD_DECIMALS.toNumber() + 1).join('0')),
)
