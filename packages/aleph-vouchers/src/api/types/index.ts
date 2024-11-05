import { types as commonTypes } from './common.js'
import { types as solanaTypes } from './solana.js'

export * from './common.js'
export * from './solana.js'

export const types = [...commonTypes, ...solanaTypes]
