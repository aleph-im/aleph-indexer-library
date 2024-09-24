import { types as commonTypes } from './common.js'
import { types as evmTypes } from './evm.js'
import { types as solanaTypes } from './solana.js'

export * from './common.js'
export * from './evm.js'
export * from './solana.js'

export const types = [...commonTypes, ...evmTypes, ...solanaTypes]
