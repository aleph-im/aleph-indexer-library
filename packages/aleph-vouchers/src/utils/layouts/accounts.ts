import {
  pluginHeaderV1Beet,
  pluginRegistryV1Beet,
  assetV1Beet,
  collectionV1Beet,
  hashedAssetV1Beet,
  // pluginHeaderV1Discriminator,
  // pluginRegistryV1Discriminator,
  // assetV1Discriminator,
  // collectionV1Discriminator,
  // hashedAssetV1Discriminator,
} from './solita/index.js'

export enum AccountType {
  PluginHeaderV1 = 'PluginHeaderV1',
  PluginRegistryV1 = 'PluginRegistryV1',
  AssetV1 = 'AssetV1',
  CollectionV1 = 'CollectionV1',
  HashedAssetV1 = 'HashedAssetV1',
}

// export const ACCOUNT_DISCRIMINATOR: Record<AccountType, Buffer> = {
//   [AccountType.PluginHeaderV1]: Buffer.from(pluginHeaderV1Discriminator),
//   [AccountType.PluginRegistryV1]: Buffer.from(pluginRegistryV1Discriminator),
//   [AccountType.AssetV1]: Buffer.from(assetV1Discriminator),
//   [AccountType.CollectionV1]: Buffer.from(collectionV1Discriminator),
//   [AccountType.HashedAssetV1]: Buffer.from(hashedAssetV1Discriminator),
// }

export const ACCOUNTS_DATA_LAYOUT: Record<AccountType, any> = {
  [AccountType.PluginHeaderV1]: pluginHeaderV1Beet,
  [AccountType.PluginRegistryV1]: pluginRegistryV1Beet,
  [AccountType.AssetV1]: assetV1Beet,
  [AccountType.CollectionV1]: collectionV1Beet,
  [AccountType.HashedAssetV1]: hashedAssetV1Beet,
}
