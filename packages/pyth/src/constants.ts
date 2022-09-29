import BN from 'bn.js'
import { constants } from '@aleph-indexer/core'
import { getPythProgramKeyForCluster } from '@pythnetwork/client'
import { TimeFrame } from '@aleph-indexer/framework'

export enum ProgramName {
  Pyth = 'pyth',
}

export const PYTH_PROGRAM_ID_PK = getPythProgramKeyForCluster('mainnet-beta')
export const PYTH_PROGRAM_ID = PYTH_PROGRAM_ID_PK.toBase58()

export const timeFrames = [
  TimeFrame.Minute,
  TimeFrame.Minute5,
  TimeFrame.Minute15,
  TimeFrame.Minute30,
  TimeFrame.Hour,
  TimeFrame.Hour2,
  TimeFrame.Hour4,
  TimeFrame.Hour8,
  TimeFrame.Day,
  TimeFrame.Week,
  TimeFrame.Month,
  TimeFrame.Month3,
  TimeFrame.Month6,
  TimeFrame.Year,
  TimeFrame.All,
]

// WADS
export const usdDecimals = new BN(constants.usdDecimals)
export const usdWad = new BN(
  '1'.concat(Array(usdDecimals.toNumber() + 1).join('0')),
)
export const WAD_DECIMALS = new BN(18)
export const WAD = new BN(
  '1'.concat(Array(WAD_DECIMALS.toNumber() + 1).join('0')),
)
