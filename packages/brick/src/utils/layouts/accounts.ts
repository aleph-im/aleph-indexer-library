import {
  marketplaceDiscriminator,
  marketplaceBeet,
  productDiscriminator,
  productBeet,
  rewardDiscriminator,
  rewardBeet,
  accessDiscriminator,
  accessBeet,
  paymentDiscriminator,
  paymentBeet,
} from './solita/index.js'

export enum AccountType {
  Marketplace = 'Marketplace',
  Product = 'Product',
  Reward = 'Reward',
  Access = 'Access',
  Payment = 'Payment',
}

export const ACCOUNT_DISCRIMINATOR: Record<AccountType, Buffer> = {
  [AccountType.Marketplace]: Buffer.from(marketplaceDiscriminator),
  [AccountType.Product]: Buffer.from(productDiscriminator),
  [AccountType.Reward]: Buffer.from(rewardDiscriminator),
  [AccountType.Access]: Buffer.from(accessDiscriminator),
  [AccountType.Payment]: Buffer.from(paymentDiscriminator),
}

export const ACCOUNTS_DATA_LAYOUT: Record<AccountType, any> = {
  [AccountType.Marketplace]: marketplaceBeet,
  [AccountType.Product]: productBeet,
  [AccountType.Reward]: rewardBeet,
  [AccountType.Access]: accessBeet,
  [AccountType.Payment]: paymentBeet,
}
