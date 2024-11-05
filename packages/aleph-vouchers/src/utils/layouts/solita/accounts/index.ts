export * from './AssetV1.js'
export * from './CollectionV1.js'
export * from './HashedAssetV1.js'
export * from './PluginHeaderV1.js'
export * from './PluginRegistryV1.js'

import { PluginHeaderV1 } from './PluginHeaderV1.js'
import { PluginRegistryV1 } from './PluginRegistryV1.js'
import { AssetV1 } from './AssetV1.js'
import { CollectionV1 } from './CollectionV1.js'
import { HashedAssetV1 } from './HashedAssetV1.js'

export const accountProviders = {
  PluginHeaderV1,
  PluginRegistryV1,
  AssetV1,
  CollectionV1,
  HashedAssetV1,
}
