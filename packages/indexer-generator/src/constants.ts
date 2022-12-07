export const primitivesMap: Record<string, string> = {
  u8: 'number',
  i8: 'number',
  u16: 'number',
  i16: 'number',
  u32: 'number',
  i32: 'number',
  f32: 'number',
  f64: 'number',

  u64: 'BN',
  i64: 'BN',
  u128: 'BN',
  i128: 'BN',

  bool: 'boolean',
  string: 'string',
  publicKey: 'PublicKey',
  bytes: 'Buffer',
}

export const primitivesMapGraphqQl: Record<string, string> = {
  u8: 'GraphQLInt',
  i8: 'GraphQLInt',
  u16: 'GraphQLInt',
  i16: 'GraphQLInt',
  u32: 'GraphQLInt',
  i32: 'GraphQLInt',
  f32: 'GraphQLInt',
  f64: 'GraphQLInt',

  u64: 'GraphQLBigNumber',
  i64: 'GraphQLBigNumber',
  u128: 'GraphQLBigNumber',
  i128: 'GraphQLBigNumber',

  bool: 'GraphQLBoolean',
  string: 'GraphQLString',
  publicKey: 'GraphQLString',
  bytes: 'GraphQLString',
}
