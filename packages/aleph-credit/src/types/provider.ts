export enum ProviderId {
  WALLET = 'WALLET',
  TRANSAK = 'TRANSAK',
}

export enum BlockchainId {
  Ethereum = 'etherum',
  EthereumTestnet = 'ethereum-sepolia',
}

export enum FiatId {
  EUR = 'EUR',
  USD = 'USD',
}

export enum TokenId {
  USDC = 'USDC',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  TRANSFERED = 'TRANSFERED',
  INDEXED = 'INDEXED',
  BROADCASTED = 'BROADCASTED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentMethod {
  TokenTransfer = 'token_transfer',
  SepaTransfer = 'sepa_transfer',
  DebitCard = 'debit_card',
  CreditCard = 'credit_card',
  Paypal = 'paypal',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
  Other = 'other',
}

export type PaymentConfig = Record<string, unknown> & { url: string }

export type Payment = {
  id: string
  provider_id: ProviderId
  status: PaymentStatus
  chain: BlockchainId
  user_address: string
  contract_address: string
  in_amount: number
  in_currency: FiatId | TokenId
  out_token: string
  config: PaymentConfig
  created_at: number
  updated_at: number
  provider_payment_id?: string
  payment_method?: PaymentMethod
  payment_method_detail?: string
  status_detail?: string
  provider_address?: string
  tx_hash?: string
  out_amount?: number
  data?: string
}
