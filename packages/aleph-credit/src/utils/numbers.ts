import BN from 'bn.js'
import { tokenDecimalsMap } from './constants.js'
import { StorageMapValueFn } from '@aleph-indexer/core'

function hexStringToBigNumber(hex: string): BN {
  hex = hex.replace('0x', '')
  return new BN(hex, 'hex')
}

export function hexStringToUint256(hex: string): string {
  return bigNumberToUint256(hexStringToBigNumber(hex))
}

// -----

function bigNumberToHexString(bn: BN, l: number): string {
  return bn.toString('hex', l)
}

function bigNumberToNumber(bn: BN, decimals: number): number {
  return bnDiv(bn, decimals)
}

function bigNumberToUint256(bn: BN): string {
  return bigNumberToHexString(bn, 64)
}

function bigNumberToInt96(bn: BN): string {
  return bigNumberToHexString(bn, 24)
}

// -----

function bnDiv(num: BN, decimals: number): number {
  const copy = num.clone()
  const den = new BN(10).pow(new BN(decimals))

  const { div, mod: rem } = copy.divmod(den)
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

// ----------

function getBNFormats(
  bnOrHex: string | BN,
  token: string,
  format: 'uint256' | 'int96' = 'uint256',
): {
  value: string
  valueBN: BN
  valueNum: number
} {
  const valueBN = BN.isBN(bnOrHex) ? bnOrHex : hexStringToBigNumber(bnOrHex)

  const value = BN.isBN(bnOrHex)
    ? format === 'uint256'
      ? bigNumberToUint256(valueBN)
      : bigNumberToInt96(valueBN)
    : bnOrHex

  const valueNum = bigNumberToNumber(valueBN, tokenDecimalsMap[token])

  return {
    value,
    valueBN,
    valueNum,
  }
}

// @todo: Fix typing in framework
// @todo: Fix & support mapFn
export function createBNMapper(propsToMap: string[]): StorageMapValueFn<any> {
  return async (value: any): Promise<any> => {
    // @note: Indexes sometimes are not synced with main storage
    if (!value) return value

    try {
      // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
      for (const propKey of propsToMap) {
        const rawPropValue = value[propKey]

        if (typeof rawPropValue !== 'string') continue

        const {
          value: valString,
          valueBN,
          valueNum,
        } = getBNFormats(rawPropValue, value.token)

        value[propKey] = valString
        value[`${propKey}BN`] = valueBN
        value[`${propKey}Num`] = valueNum
      }
    } catch (e) {
      console.log(e)
      console.log('ERR VAL', value)
    }

    return value
  }
}
