import BN from 'bn.js'
import { config } from '@aleph-indexer/core'
import { TokenAccount } from '../types.js'

export function uint256ToBigNumber(hex: string): BN {
  hex = hex.replace('0x', '')
  return new BN(hex, 'hex')
}

export function bigNumberToString(bn: BN): string {
  return bn.toString('hex', 64)
}

export function uint256ToString(hex: string): string {
  return bigNumberToString(uint256ToBigNumber(hex))
}

export function uint256ToNumber(hex: string, decimals: number): number {
  return bnDiv(uint256ToBigNumber(hex), decimals)
}

export function bnDiv(num: BN, decimals: number): number {
  const den = new BN(10).pow(new BN(decimals))

  const { div, mod: rem } = num.divmod(den)
  const quotient = div.toNumber()

  let remN

  while (remN === undefined && decimals > 0) {
    try {
      remN = rem.toNumber()
    } catch {
      rem.idivn(10)
      decimals--
    }
  }

  remN = remN || 0

  for (let i = 0; i < decimals; i++) {
    remN = remN / 10
  }
  return quotient + remN
}

export function round(num: number, decimals = 2): number {
  const pow = 10 ** decimals
  return Math.round((num + Number.EPSILON) * pow) / pow
}

export function getTokenAccounts(): TokenAccount[] {
  if (!config.INDEXER_ACCOUNTS) return []

  return config.INDEXER_ACCOUNTS.split(',').map((conf: string) => {
    const [blockchain, contract, deployer, sup, dec] = conf.split(':')

    const supply = new BN(sup, 10)
    const decimals = Number(dec)

    return { blockchain, contract, deployer, supply, decimals } as TokenAccount
  })
}
