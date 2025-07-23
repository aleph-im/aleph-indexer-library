import { AlephHttpClient } from '@aleph-sdk/client'
import { PostResponse } from '@aleph-sdk/message'

import { alephConfig } from './constants.js'
import { Payment } from '../types/provider.js'

const address = alephConfig.paymentAddress
const apiServer = alephConfig.host
const channel = alephConfig.paymentChannel
const postType = `aleph_credit_payment`

const client = new AlephHttpClient(apiServer)

export async function getPaymentDetail(
  idOrHash: string,
): Promise<Payment | undefined> {
  const post = await getPaymentDetailMessage(idOrHash)
  const payment = post?.content.payment

  return payment
}

export async function getPaymentDetailMessage(
  idOrHash: string,
): Promise<PostResponse<{ payment: Payment }> | undefined> {
  const tags = [
    `payment_id_${idOrHash}`,
    `provider_payment_id_${idOrHash}`,
    `tx_hash_${idOrHash}`,
  ]

  const response = await client.postClient.getAll<{ payment: Payment }>({
    addresses: [address],
    channels: [channel],
    types: postType,
    page: 1,
    pagination: 1,
    tags,
  })

  const [post] = response.posts
  return post
}
