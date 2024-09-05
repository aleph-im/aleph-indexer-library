import BN from 'bn.js'

export function hexStringToBigNumber(hex: string): BN {
  hex = hex.replace('0x', '')
  return new BN(hex, 'hex')
}

export function hexStringToNumber(hex: string, decimals: number): number {
  return bnDiv(hexStringToBigNumber(hex), decimals)
}

export function hexStringToUint256(hex: string): string {
  return bigNumberToUint256(hexStringToBigNumber(hex))
}

export function hexStringToInt96(hex: string): string {
  return bigNumberToInt96(hexStringToBigNumber(hex))
}

// -----

export function bigNumberToHexString(bn: BN, l = 64): string {
  return bn.toString('hex', l)
}

export function bigNumberToNumber(bn: BN, decimals: number): number {
  return bnDiv(bn, decimals)
}

export function bigNumberToUint256(bn: BN): string {
  return bigNumberToHexString(bn, 64)
}

export function bigNumberToInt96(bn: BN): string {
  return bigNumberToHexString(bn, 24)
}

// -----

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

export * from './constants.js'
export * from './abis/index.js'
