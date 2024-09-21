import BN from 'bn.js'
import { BlockchainId } from '@aleph-indexer/framework'
import { blockchainDecimals } from './constants.js'
import {
  StorageEntry,
  StorageMapFn,
  StorageMapValueFn,
} from '@aleph-indexer/core'

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

export function bigNumberToHexString(bn: BN, l: number): string {
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

export function round(num: number, decimals = 2): number {
  const pow = 10 ** decimals
  return Math.round((num + Number.EPSILON) * pow) / pow
}

// ------

export function getStreamRealTimeBalance(
  flowRateBN: BN,
  timestamp: number,
  currentTimestamp = Date.now(),
): BN {
  const elapsedTime = new BN(Math.trunc((currentTimestamp - timestamp) / 1000))
  return flowRateBN.mul(elapsedTime)
}

export function getStreamTotalBalance(
  depositBN: BN,
  staticBalanceBN: BN,
  realTimeBalanceBN:
    | BN
    | { flowRateBN: BN; timestamp: number; currentTimestamp?: number },
): BN {
  realTimeBalanceBN = BN.isBN(realTimeBalanceBN)
    ? realTimeBalanceBN
    : getStreamRealTimeBalance(
        realTimeBalanceBN.flowRateBN,
        realTimeBalanceBN.timestamp,
        realTimeBalanceBN.currentTimestamp,
      )

  return staticBalanceBN.sub(depositBN).add(realTimeBalanceBN)
}

// ----------

export function getBNFormats(
  bnOrHex: string | BN,
  blockchain: BlockchainId,
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

  const valueNum = bigNumberToNumber(valueBN, blockchainDecimals[blockchain])

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
        } = getBNFormats(rawPropValue, value.blockchain)

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
