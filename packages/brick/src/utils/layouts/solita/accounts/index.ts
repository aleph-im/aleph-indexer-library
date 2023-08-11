export * from './Access.js'
export * from './Marketplace.js'
export * from './Payment.js'
export * from './Product.js'
export * from './Reward.js'

import { Marketplace } from './Marketplace.js'
import { Product } from './Product.js'
import { Reward } from './Reward.js'
import { Access } from './Access.js'
import { Payment } from './Payment.js'

export const accountProviders = {
  Marketplace,
  Product,
  Reward,
  Access,
  Payment,
}
