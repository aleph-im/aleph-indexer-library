import { PublicKey } from "@solana/web3.js"
import { AlephSolanaContract } from "./types"

export const SOLANA_MESSAGES_PROGRAM_ID =
  'ALepH1n9jxScbz45aZhBYVa35zxBNbKSvL6rWQpb4snc'
export const SOLANA_MESSAGES_PROGRAM_ID_PK = new PublicKey(
    SOLANA_MESSAGES_PROGRAM_ID,
)

export const SOLANA_MESSAGES_PROGRAM_IDL: AlephSolanaContract = {
  "version": "0.1.0",
  "name": "aleph_solana_contract",
  "instructions": [
    {
      "name": "doEmit",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "doMessage",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "msgtype",
          "type": "string"
        },
        {
          "name": "msgcontent",
          "type": "string"
        }
      ]
    }
  ],
  "events": [
    {
      "name": "SyncEvent",
      "fields": [
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "message",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "MessageEvent",
      "fields": [
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "msgtype",
          "type": "string",
          "index": false
        },
        {
          "name": "msgcontent",
          "type": "string",
          "index": false
        }
      ]
    }
  ]
}
