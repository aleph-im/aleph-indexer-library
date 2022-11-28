import { config } from '@aleph-indexer/core'
import { ProgramName } from '../constants.js'

export enum SPLTokenDAL {
  Event = 'event',
  AccountEvent = 'account_event',
  AccountTrack = 'account_track',
  AccountTrackInit = 'account_track_init',
  AccountTrackClose = 'account_track_close',
  AccountBalance = 'account_balance',
  BalanceAccount = 'balance_account',
}

export const dbFolder = `${config.DB_FOLDER}/${ProgramName.SPLToken}`
