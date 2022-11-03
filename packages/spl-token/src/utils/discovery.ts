import fs, { Stats } from 'fs'
import path from 'path'
import { SolanaRPC, config } from '@aleph-indexer/core'
import { discoveryLevelStorage, DiscoveryEntity } from '../dal/discovery.js'
import { DiscoveryFn, DiscoveryFnReturn } from '../types.js'

export async function discoveryFn(
  solana: SolanaRPC,
): Promise<DiscoveryFnReturn> {
  // @note: Get addresses from env vars
  const mintsSet = new Set(
    config.SPL_TOKEN_MINTS ? config.SPL_TOKEN_MINTS.split(',') : [],
  )
  const accountsSet = new Set(
    config.SPL_TOKEN_ACCOUNTS ? config.SPL_TOKEN_ACCOUNTS.split(',') : [],
  )

  // @note: Get addresses from storage
  for await (const { key: item } of discoveryLevelStorage.getAll()) {
    const [address, type] = item.split('|')
    if (type === 'mint') mintsSet.add(address)
    if (type === 'account') accountsSet.add(address)
  }

  // @note: Get addresses from custom discovery scripts under "discoveryPath"

  const discoveryPath = path.resolve(
    config.SPL_TOKEN_DISCOVERY_FOLDER || 'discovery',
  )

  if (discoveryPath) {
    try {
      const files = await new Promise<string[]>((resolve, reject) =>
        fs.readdir(discoveryPath, (error, files) =>
          error ? reject(error) : resolve(files),
        ),
      )

      const discoveryWhitelist = config.SPL_TOKEN_DISCOVERY_WHITELIST
        ? config.SPL_TOKEN_DISCOVERY_WHITELIST.split(',')
        : []

      const filteredFilePaths = []

      for (const file of files) {
        if (!file.endsWith('.js')) continue

        let filePath = path.join(discoveryPath, file)

        console.log('[Discovery] => whilisting', file, filePath)

        const stats = await new Promise<Stats>((resolve, reject) =>
          fs.lstat(filePath, (error, res) =>
            error ? reject(error) : resolve(res),
          ),
        )

        const isDir = stats.isDirectory()
        const fileName = isDir ? file : file.split('.')[0]
        filePath = isDir ? path.join(filePath, 'index.js') : filePath

        if (discoveryWhitelist.length && !discoveryWhitelist.includes(fileName))
          continue

        console.log('[Discovery] => whitelisted', fileName, filePath)
        filteredFilePaths.push({ fileName, filePath })
      }

      if (filteredFilePaths.length) {
        await Promise.all(
          filteredFilePaths.map(async ({ fileName, filePath }) => {
            try {
              const module = await import(filePath)
              const discoverFn: DiscoveryFn = module.default

              const { accounts, mints } = await discoverFn(solana)

              const countMintBefore = mintsSet.size
              const countAccountBefore = accountsSet.size

              mints.forEach((mint) => mintsSet.add(mint))
              accounts.forEach((account) => accountsSet.add(account))

              const countMint = mintsSet.size - countMintBefore
              const countAccount = accountsSet.size - countAccountBefore
              const total = countMint + countAccount

              console.log(
                `[Discovery] => Added ${total} addresses [${countMint} mints] [${countAccount} accounts] from ${fileName}`,
              )
            } catch (e) {
              console.log(`[Discovery] => Error loading file ${fileName}`, e)
            }
          }),
        )
      }
    } catch (e) {
      console.log(`[Discovery] => Error path not found: ${discoveryPath}`, e)
    }
  }

  const result = {
    mints: [...mintsSet],
    accounts: [...accountsSet],
  }

  // @note: Save all in storage
  // @todo: Implement forget by blacklist
  const saveEntities: DiscoveryEntity[] = []

  for (const address of result.mints) {
    saveEntities.push({ address, type: 'mint' })
  }

  for (const address of result.accounts) {
    saveEntities.push({ address, type: 'account' })
  }

  await discoveryLevelStorage.save(saveEntities)

  return result
}
