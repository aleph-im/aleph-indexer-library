import { BlockchainChain, BlockchainId } from '@aleph-indexer/framework'

export const METAPLEX_CORE_PROGRAM_NAME = 'mpl-core-program'

export const METAPLEX_CORE_PROGRAM_ID =
  'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'

export const blockchainTokenContract: Record<BlockchainId, string> = {
  // [BlockchainChain.Solana]: '3V1UtauHS2F31civmDaT5MFYkntSjX82LsDcBKCZf5iJ', // Mainnet
  [BlockchainChain.Solana]: 'E5g1xaobkaVpAgJQKMVQ3TwB3YuZuU52TeDHx5RHJdrD', // MAinnet TEST
}
