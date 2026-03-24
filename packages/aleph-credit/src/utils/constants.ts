import { config } from '@aleph-indexer/core'

export const alephConfig = {
  host: config.ALEPH_HOST || 'https://api2.aleph.im',
  paymentChannel: config.ALEPH_PAYMENT_CHANNEL || 'ALEPH_CREDIT_STAGING',
  paymentAddress: config.ALEPH_PAYMENT_ADDRESS,
}
