import dotenv from 'dotenv-defaults'
import Web3 from 'web3'
import { request, gql } from 'graphql-request'

dotenv.config()
const config = process.env

const blockchain = process.argv[2]
if (!blockchain)
  throw new Error('INVALID BLOCKCHAIN ARG. Try: node verifyEVM.js ethereum')

const rpcEnv = `${blockchain.toUpperCase()}_TEST_RPC`
const rpcUrl = config[rpcEnv]
if (!rpcUrl) throw new Error(`ENV VAR ${rpcEnv} NOT SET`)

const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))

const tokenEnv = `${blockchain.toUpperCase()}_TEST_TOKEN`
const tokenAddress = config[tokenEnv]
if (!tokenAddress) throw new Error(`ENV VAR ${tokenEnv} NOT SET`)

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
]

const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress)

const graphqlEnv = `GQL_TEST_API`
const graphqlUrl = config[`GQL_TEST_API`]

if (!graphqlUrl) throw new Error(`ENV VAR ${graphqlEnv} NOT SET`)

const query = gql`
  {
    accountState(blockchain: "${blockchain}", type: log) {
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

    for (const state of states) {
      const { completeHistory, progress } = state
      if (!completeHistory || progress !== 100) throw new Error('Not synced')
    }

    balances = data.balances
  }, 0)

  console.log(`Init checks for ${balances.length} accounts`)

  for (const item of balances) {
    const { account, balance: expectedBalance } = item

    const currentBalance = await retry(async () => {
      // const currentBalance = await web3.eth.getBalance(account)
      return (await tokenContract.methods.balanceOf(account).call()).toString()
    })

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
