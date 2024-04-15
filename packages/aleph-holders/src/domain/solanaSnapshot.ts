import { PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, solanaPrivateRPC } from "@aleph-indexer/solana"
import { blockchainDecimals, blockchainTokenContract, uint256ToBigNumber, uint256ToNumber } from "../utils/index.js"
import { BlockchainChain } from '@aleph-indexer/framework'
import { SolanaBalance } from "../types.js"
import { struct } from '@solana/buffer-layout';
import { publicKey, u64 } from '@solana/buffer-layout-utils';

export interface DataSlice {
  owner: PublicKey
  amount: bigint
}

const DataSliceLayout = struct<DataSlice>([
  publicKey('owner'), 
  u64('amount'),
])

export async function solanaSnapshot(): Promise<SolanaBalance[]> {
  const connection = solanaPrivateRPC.getConnection()
  const response = await connection.getProgramAccounts(
    new PublicKey(TOKEN_PROGRAM_ID), {
      dataSlice: {
        offset: 32,
        length: 64,
      },
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 0,
            bytes: blockchainTokenContract[BlockchainChain.Solana]
          }
        }
      ]
    }
  )

  return response.map((accountResponse) => {
    const data = DataSliceLayout.decode(accountResponse.account.data)
    const balance = data.amount.toString(16)

    return {
      account: accountResponse.pubkey.toString(),
      owner: data.owner.toString(),
      balance,
      balanceBN: uint256ToBigNumber(balance),
      balanceNum: uint256ToNumber(
        balance,
        blockchainDecimals[BlockchainChain.Solana],
      )
    }
  }).filter((account) => account.balance !== '0')
}