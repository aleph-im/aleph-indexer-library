import {
  ticketAccountDataDiscriminator,
  ticketAccountDataBeet,
  stateDiscriminator,
  stateBeet,
} from './solita/index.js'

export enum AccountType {
  TicketAccountData = 'TicketAccountData',
  State = 'State',
}

export const ACCOUNT_DISCRIMINATOR: Record<AccountType, Buffer> = {
  [AccountType.TicketAccountData]: Buffer.from(ticketAccountDataDiscriminator),
  [AccountType.State]: Buffer.from(stateDiscriminator),
}

export const ACCOUNTS_DATA_LAYOUT: Record<AccountType, any> = {
  [AccountType.TicketAccountData]: ticketAccountDataBeet,
  [AccountType.State]: stateBeet,
}
