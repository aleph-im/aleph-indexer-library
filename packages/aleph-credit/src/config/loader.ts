import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { config as envConfig } from '@aleph-indexer/core'
import { ChainsConfig, ChainConfig } from './schema.js'
import { defaultChainsConfig } from './defaults.js'

function deepMerge(target: ChainConfig, source: Partial<ChainConfig>): ChainConfig {
  const result = { ...target }

  if (source.tokenContracts) {
    result.tokenContracts = { ...target.tokenContracts }
    for (const [token, config] of Object.entries(source.tokenContracts)) {
      result.tokenContracts[token] = target.tokenContracts[token]
        ? { ...target.tokenContracts[token], ...config }
        : config
    }
  }

  if (source.creditContract) {
    result.creditContract = { ...target.creditContract, ...source.creditContract }
  }

  if (source.providers) {
    result.providers = { ...target.providers, ...source.providers }
  }

  return result
}

function loadFromFile(): Partial<ChainsConfig> {
  const configPath = envConfig.INDEXER_CHAINS_CONFIG || path.resolve('config/chains.yaml')

  if (!fs.existsSync(configPath)) return {}

  const raw = fs.readFileSync(configPath, 'utf-8')
  return parseYaml(raw) || {}
}

function loadConfig(): ChainsConfig {
  const fileConfig = loadFromFile()
  const merged: ChainsConfig = { ...defaultChainsConfig }

  for (const [chain, chainConfig] of Object.entries(fileConfig)) {
    if (merged[chain]) {
      merged[chain] = deepMerge(merged[chain], chainConfig)
    } else {
      merged[chain] = chainConfig as ChainConfig
    }
  }

  return merged
}

export const chainsConfig: ChainsConfig = loadConfig()

export function getChainConfig(chain: string): ChainConfig {
  const config = chainsConfig[chain]
  if (!config) throw new Error(`No config found for chain: ${chain}`)
  return config
}

/**
 * Build a decimals lookup map (address -> decimals) from the loaded config.
 * Includes token contracts and native payment address (18 decimals) for all chains.
 */
export function getDecimalsMap(): Record<string, number> {
  const map: Record<string, number> = {}

  for (const chainConfig of Object.values(chainsConfig)) {
    for (const token of Object.values(chainConfig.tokenContracts)) {
      map[token.address] = token.decimals
    }
    if (chainConfig.creditContract.nativePayments) {
      map[chainConfig.creditContract.address] = 18
    }
  }

  return map
}

/**
 * Build a provider address lookup map (address -> providerId) for a given chain.
 */
export function getProviderAddressMap(chain: string): Record<string, string> {
  const config = getChainConfig(chain)
  const map: Record<string, string> = {}

  for (const [providerId, addresses] of Object.entries(config.providers)) {
    for (const address of addresses) {
      map[address] = providerId
    }
  }

  return map
}
