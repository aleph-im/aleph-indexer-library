import dotenv from 'dotenv-defaults'
import { Connection, PublicKey } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { request, gql } from 'graphql-request'
import { BN } from 'bn.js'

dotenv.config()
const config = process.env

const blockchain = process.argv[2] || 'solana'
if (!blockchain)
  throw new Error('INVALID BLOCKCHAIN ARG. Try: node verifyEVM.js solana')

const rpcEnv = `${blockchain.toUpperCase()}_TEST_RPC`
const rpcUrl = config[rpcEnv]
if (!rpcUrl) throw new Error(`ENV VAR ${rpcEnv} NOT SET`)

const connection = new Connection(rpcUrl)

const tokenEnv = `${blockchain.toUpperCase()}_TEST_TOKEN`
const tokenAddress = config[tokenEnv]
if (!tokenAddress) throw new Error(`ENV VAR ${tokenEnv} NOT SET`)

const tokenAddressPublicKey = new PublicKey(tokenAddress)
const tokenContract = new Token(
  connection,
  tokenAddressPublicKey,
  TOKEN_PROGRAM_ID,
  null,
)

const graphqlEnv = `GQL_TEST_API`
const graphqlUrl = config[`GQL_TEST_API`]

if (!graphqlUrl) throw new Error(`ENV VAR ${graphqlEnv} NOT SET`)

const query = gql`
  {
    accountState(blockchain: "${blockchain}", type: transaction) {
      completeHistory
      progress
      pending
    }
    balances(blockchain: "${blockchain}", limit: 9999999) {
      account
      balance
    }
  }
`

// Función para verificar los balances
async function verifyBalances() {
  let error = 0
  let success = 0

  console.log(`Querying ${blockchain} ${graphqlUrl} ${rpcUrl} ${query}`)
  let balances

  await retry(async () => {
    const data = await request(graphqlUrl, query)
    const states = data.accountState

    console.log('states', states)

    // for (const state of states) {
    //   const { completeHistory, progress } = state
    //   if (!completeHistory || progress !== 100) throw new Error('Not synced')
    // }

    balances = data.balances
  }, 0)

  console.log(`Init checks for ${balances.length} accounts`)

  for (const item of balances) {
    const { account, balance: expectedBalance } = item

    let accountPublicKey = new PublicKey(account)
    let tokenAccountInfo

    // @note: Check if the accounts is a token account getting the token info
    tokenAccountInfo = await getTokenAccountInfo(accountPublicKey)

    if (!tokenAccountInfo) {
      tokenAccountInfo = { amount: new BN('0') }

      const ownedAccounts = await getTokenAccountsFromOwnerAccount(
        accountPublicKey,
      )

      for (const ownedTokenAccount of ownedAccounts) {
        const amount =
          ownedTokenAccount.account.data.parsed.info.tokenAmount.amount

        console.log(
          `OWNER [${accountPublicKey.toString()}] -> ${ownedTokenAccount.pubkey.toString()} (${amount})`,
        )

        tokenAccountInfo.amount.iadd(new BN(amount))
      }
    }

    const currentBalance = tokenAccountInfo.amount.toString()

    if (currentBalance !== expectedBalance) {
      error++
      console.log(`Expected balance: ${expectedBalance}`)
      console.log(`Current balance: ${currentBalance}`)
      console.log(`🔴 Wrong balance for account ${account}`)
    } else {
      success++
      console.log(
        `🟢 Correct balance for account ${account}: ${currentBalance}`,
      )
    }
  }

  console.table([
    {
      name: 'Status',
      value: error ? '🔴' : '🟢',
    },
    {
      name: 'Blockchain',
      value: blockchain,
    },
    {
      name: 'Accounts',
      value: success + error,
    },
    {
      name: 'Errors',
      value: error,
    },
    {
      name: 'Accuracy',
      value: `${((success * 100) / (success + error)).toFixed(2)}%`,
    },
  ])
}

async function getTokenAccountInfo(accountPublicKey) {
  let tokenAccountInfo

  await retry(async () => {
    try {
      tokenAccountInfo = await tokenContract.getAccountInfo(accountPublicKey)
    } catch (e) {
      if (e.message.indexOf('Failed to find account') !== -1) return
      if (e.message.indexOf('Invalid account owner') !== -1) return
      throw e
    }
  })

  return tokenAccountInfo
}

async function getTokenAccountsFromOwnerAccount(ownerPublicKey) {
  let tokenAccounts

  await retry(async () => {
    try {
      const { value } = await connection.getParsedTokenAccountsByOwner(
        ownerPublicKey,
        { programId: TOKEN_PROGRAM_ID, mint: tokenAddressPublicKey },
      )

      tokenAccounts = value
    } catch (e) {
      console.log(e)
      // if (e.message.indexOf('Failed to find account') !== -1) return
      // if (e.message.indexOf('Invalid account owner') !== -1) return
      ;('ignore')
      throw e
    }
  })

  return tokenAccounts
}

async function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retry(fn, after = 1000, times = Number.POSITIVE_INFINITY) {
  try {
    return await fn()
  } catch (e) {
    if (times === Number.POSITIVE_INFINITY || times <= 0) {
      console.log(e)
    }

    if (times <= 0) return

    await sleep(after)
    return await retry(fn, after + after, times - 1)
  }
}

verifyBalances()
