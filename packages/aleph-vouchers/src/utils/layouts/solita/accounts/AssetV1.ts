/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { Key, keyBeet } from '../types/Key.js'
import {
  UpdateAuthority,
  updateAuthorityBeet,
} from '../types/UpdateAuthority.js'

/**
 * Arguments used to create {@link AssetV1}
 * @category Accounts
 * @category generated
 */
export type AssetV1Args = {
  key: Key
  owner: web3.PublicKey
  updateAuthority: UpdateAuthority
  name: string
  uri: string
  seq: beet.COption<beet.bignum>
}
/**
 * Holds the data for the {@link AssetV1} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class AssetV1 implements AssetV1Args {
  private constructor(
    readonly key: Key,
    readonly owner: web3.PublicKey,
    readonly updateAuthority: UpdateAuthority,
    readonly name: string,
    readonly uri: string,
    readonly seq: beet.COption<beet.bignum>,
  ) {}

  /**
   * Creates a {@link AssetV1} instance from the provided args.
   */
  static fromArgs(args: AssetV1Args) {
    return new AssetV1(
      args.key,
      args.owner,
      args.updateAuthority,
      args.name,
      args.uri,
      args.seq,
    )
  }

  /**
   * Deserializes the {@link AssetV1} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [AssetV1, number] {
    return AssetV1.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link AssetV1} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<AssetV1> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find AssetV1 account at ${address}`)
    }
    return AssetV1.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
    ),
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, assetV1Beet)
  }

  /**
   * Deserializes the {@link AssetV1} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [AssetV1, number] {
    return assetV1Beet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link AssetV1} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return assetV1Beet.serialize(this)
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link AssetV1} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: AssetV1Args) {
    const instance = AssetV1.fromArgs(args)
    return assetV1Beet.toFixedFromValue(instance).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link AssetV1} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: AssetV1Args,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      AssetV1.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link AssetV1} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      key: 'Key.' + Key[this.key],
      owner: this.owner.toBase58(),
      updateAuthority: this.updateAuthority.__kind,
      name: this.name,
      uri: this.uri,
      seq: this.seq,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const assetV1Beet = new beet.FixableBeetStruct<AssetV1, AssetV1Args>(
  [
    ['key', keyBeet],
    ['owner', beetSolana.publicKey],
    ['updateAuthority', updateAuthorityBeet],
    ['name', beet.utf8String],
    ['uri', beet.utf8String],
    ['seq', beet.coption(beet.u64)],
  ],
  AssetV1.fromArgs,
  'AssetV1',
)