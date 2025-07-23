import { types as commonTypes } from './common.js'
import { types as evmTypes } from './evm.js'

export * from './common.js'
export * from './evm.js'

export const types = [...commonTypes, ...evmTypes]
