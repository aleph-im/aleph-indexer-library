import { SolendMarket } from '@solendprotocol/solend-sdk'
import { ACCOUNT_MAP } from '../constants.js'

// weird hack against solend SDK's weird hack
import BN from 'bn.js'
import '@solendprotocol/solend-sdk'
import { getSolanaRPC } from './solana.js'
import { BlockchainChain } from '@aleph-indexer/framework'
BN.prototype.toJSON = function toJSON() {
  return this.toString(16, 2)
}

const connection = getSolanaRPC(BlockchainChain.Solana).getConnection()

export const SOLEND_SDK = await SolendMarket.initialize(
  connection,
  'production',
  ACCOUNT_MAP['solend'].mainMarket,
)
