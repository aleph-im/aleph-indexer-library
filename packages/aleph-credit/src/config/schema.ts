export type TokenConfig = {
  address: string
  decimals: number
}

export type CreditContractConfig = {
  address: string
  nativePayments: boolean
}

export type ChainConfig = {
  tokenContracts: Record<string, TokenConfig>
  creditContract: CreditContractConfig
  providers: Record<string, string[]>
}

export type ChainsConfig = Record<string, ChainConfig>
