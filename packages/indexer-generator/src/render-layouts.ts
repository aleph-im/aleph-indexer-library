import { ViewInstructions, ViewAccounts } from './types.js'

export function renderLayoutsFiles(
  filename: string,
  instructionsView: ViewInstructions | undefined,
  accountsView: ViewAccounts | undefined,
): string[] {
  const NAME = filename.toUpperCase()
  const name = filename.toLowerCase()

  let accountLayouts = ''

  if (accountsView && accountsView.length > 0) {
    accountLayouts = `import {
`

    for (const account of accountsView) {
      accountLayouts += `  ${account.name
        .charAt(0)
        .toLowerCase()
        .concat(account.name.slice(1))}Discriminator,
  ${account.name.charAt(0).toLowerCase().concat(account.name.slice(1))}Beet,
`
    }
    accountLayouts += `} from './solita/index.js'

export enum AccountType {
        `
    for (const account of accountsView) {
      accountLayouts += `   ${account.name} = '${account.name}',
`
    }
    accountLayouts += `}

export const ACCOUNT_DISCRIMINATOR: Record<AccountType, Buffer> = {
`
    for (const account of accountsView) {
      accountLayouts += `   [AccountType.${
        account.name
      }]: Buffer.from(${account.name
        .charAt(0)
        .toLowerCase()
        .concat(account.name.slice(1))}Discriminator),
`
    }
    accountLayouts += `}

export const ACCOUNTS_DATA_LAYOUT: Record<
    AccountType,
    any
> = {
`
    for (const account of accountsView) {
      accountLayouts += `   [AccountType.${account.name}]: ${account.name
        .charAt(0)
        .toLowerCase()
        .concat(account.name.slice(1))}Beet,
`
    }
    accountLayouts += `}`
  }

  let ixLayouts = ''
  if (instructionsView && instructionsView.instructions.length > 0) {
    ixLayouts += `import { EventBase } from '@aleph-indexer/core'
import * as solita from './solita/index.js'
`
    for (const otherImport of instructionsView.imports.otherImports) {
      if (isBN(otherImport))
        ixLayouts += `import { PublicKey } from '@solana/web3.js'
`
      if (isPubkey(otherImport))
        ixLayouts += `import BN from 'bn.js'
`
    }

    ixLayouts += `
export enum InstructionType { 
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   ${instruction.name} = '${instruction.name}Event',
`
    }
    ixLayouts += `}

export type InstructionBase = EventBase<InstructionType> & {
        programId: string
        signer: string
        account: string
}

/*-----------------------* CUSTOM EVENTS TYPES *-----------------------*/

`
    for (const instruction of instructionsView.instructions) {
      let definedData = false

      if (instruction.args.length > 0) {
        for (const arg of instruction.args) {
          for (const definedImport of instructionsView.imports.definedImports) {
            if (arg.tsType === definedImport) definedData = true
          }
        }
        if (definedData) {
          ixLayouts += `

export type ${instruction.name}Info = {`
          if (instruction.args.length > 0) {
            if (instruction.args.length === 1) {
              ixLayouts += ` 
        data: solita.${instruction.args[0].tsType}
`
            } else {
              ixLayouts += ` 
        data: solita.${instruction.name}InstructionArgs
`
            }
          }
          if (instruction.accounts.length > 0) {
            ixLayouts += `accounts: solita.${instruction.name}InstructionAccounts
`
          }

          ixLayouts += `}`
        } else {
          ixLayouts += `export type ${instruction.name}EventData = {`
          for (const arg of instruction.args) {
            ixLayouts += ` 
        ${arg.name}: ${arg.tsType}`
          }
          ixLayouts += `}

export type ${instruction.name}Info = {
        data: ${instruction.name}EventData
`

          if (instruction.accounts.length > 0) {
            ixLayouts += `accounts: solita.${instruction.name}InstructionAccounts
`
          }

          ixLayouts += `}`
        }
      } else {
        ixLayouts += `

export type ${instruction.name}Info = {
`
        if (instruction.accounts.length > 0) {
          ixLayouts += `accounts: solita.${instruction.name}InstructionAccounts
`
        }
        ixLayouts += `}`
      }
      ixLayouts += `

export type ${instruction.name}Event = InstructionBase &
        ${instruction.name}Info & {
                type: InstructionType.${instruction.name}
        }

/*----------------------------------------------------------------------*/

`
    }

    ixLayouts += `
export function getInstructionType(data: Buffer): InstructionType | undefined {
  const discriminator = data.slice(0, 8)
  return IX_METHOD_CODE.get(discriminator.toString('ascii'))
}

export const IX_METHOD_CODE: Map<string, InstructionType | undefined > = 
  new Map<string, InstructionType | undefined >([
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   [Buffer.from(solita.${instruction.name
        .charAt(0)
        .toLowerCase()
        .concat(
          instruction.name.slice(1),
        )}InstructionDiscriminator).toString('ascii'), InstructionType.${
        instruction.name
      }],
`
    }
    ixLayouts += `
])
export const IX_DATA_LAYOUT: Partial<Record<InstructionType, any>> = {
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   [InstructionType.${
        instruction.name
      }]: solita.${instruction.name
        .charAt(0)
        .toLowerCase()
        .concat(instruction.name.slice(1))}Struct,
`
    }

    ixLayouts += `}

export const IX_ACCOUNTS_LAYOUT: Partial<Record<InstructionType, any>> = {
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   [InstructionType.${instruction.name}]: solita.${instruction.name}Accounts,
`
    }

    ixLayouts += `}
    
export type ParsedEventsInfo = 
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   | ${instruction.name}Info
`
    }

    ixLayouts += `       
export type ParsedEvents = 
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   | ${instruction.name}Event
`
    }
  }

  let indexLayouts = `export * from './instructions.js'
export * from './solita/index.js'
`
  if (accountsView) indexLayouts += `export * from './accounts.js'`
  const layoutLayouts = `import { ${NAME}_PROGRAM_ID } from '../../constants.js'
import { ACCOUNTS_DATA_LAYOUT } from './accounts.js'
import {
  InstructionType,
  IX_DATA_LAYOUT,
  getInstructionType,
  IX_ACCOUNTS_LAYOUT,
} from './instructions.js'

export default {
  [${NAME}_PROGRAM_ID]: {
    name: '${name}',
    programID: ${NAME}_PROGRAM_ID,
    accountLayoutMap: IX_ACCOUNTS_LAYOUT,
    dataLayoutMap: IX_DATA_LAYOUT,
    accountDataLayoutMap: ACCOUNTS_DATA_LAYOUT,
    eventType: InstructionType,
    getInstructionType,
  },
}`
  const txLegacy = `{
  "blockTime": 1668090825,
  "meta": {
    "err": null,
    "fee": 5000,
    "innerInstructions": [
      {
        "index": 1,
        "instructions": [
          {
            "accounts": [
              "2gCzKgSTPSy4fL7z9NQhJAKvumEofTa2DFJU4wGhQ5Jt",
              "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
              "CCJ73enCHai27dS79uhqMYMGoehVQsP1YECyDq9xvyt9",
              "3VwacVEwZWLaGCjhWdkfnYhfLWMdfhRaoHJkouUVwKub",
              "FARYkuYJfe9putyXajbS3sAngXSMxk97kqRHT7iQhoV4",
              "7sb4tQXXv2TzNMrFtxRyanQvyDUZQKC2JStYFCMzzBHV",
              "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
              "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm",
              "Bu1WfCjd8xF3VhArDWf1CgiDu6r3dbmu5hVrWo8QrZKy",
              "iwJtZ6XdRnss912F9JHotr18Tj5APj1xz29YEkzDeh8",
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ],
            "data": "2j6vnwYDURn8yzVs2R39DuaHdYH87onaPvo",
            "programId": "CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4"
          },
          {
            "parsed": {
              "info": {
                "amount": "80000000000",
                "authority": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
                "destination": "FARYkuYJfe9putyXajbS3sAngXSMxk97kqRHT7iQhoV4",
                "source": "Bu1WfCjd8xF3VhArDWf1CgiDu6r3dbmu5hVrWo8QrZKy"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "account": "7sb4tQXXv2TzNMrFtxRyanQvyDUZQKC2JStYFCMzzBHV",
                "amount": "28313",
                "mint": "CCJ73enCHai27dS79uhqMYMGoehVQsP1YECyDq9xvyt9",
                "mintAuthority": "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7"
              },
              "type": "mintTo"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "amount": "81146691474",
                "authority": "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
                "destination": "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm",
                "source": "3VwacVEwZWLaGCjhWdkfnYhfLWMdfhRaoHJkouUVwKub"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ]
      },
      {
        "index": 2,
        "instructions": [
          {
            "accounts": [
              "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
              "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
              "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q",
              "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
              "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
              "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm",
              "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
              "GSWtKpYiVaznEFGPn7P7XszQ5tUUwUiRzLkxxz58CcpU",
              "11111111111111111111111111111111",
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ],
            "data": "4iiUNUdSejRuYN4zTUsdif",
            "programId": "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD"
          },
          {
            "parsed": {
              "info": {
                "destination": "GSWtKpYiVaznEFGPn7P7XszQ5tUUwUiRzLkxxz58CcpU",
                "lamports": 84632280588,
                "source": "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q"
              },
              "type": "transfer"
            },
            "program": "system",
            "programId": "11111111111111111111111111111111"
          },
          {
            "parsed": {
              "info": {
                "amount": "79961949779",
                "authority": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
                "destination": "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
                "source": "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "amount": "1184741695",
                "authority": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
                "destination": "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
                "source": "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "destination": "Bu1WfCjd8xF3VhArDWf1CgiDu6r3dbmu5hVrWo8QrZKy",
                "lamports": 84632280588,
                "source": "GSWtKpYiVaznEFGPn7P7XszQ5tUUwUiRzLkxxz58CcpU"
              },
              "type": "transfer"
            },
            "program": "system",
            "programId": "11111111111111111111111111111111"
          },
          {
            "parsed": {
              "info": {
                "account": "Bu1WfCjd8xF3VhArDWf1CgiDu6r3dbmu5hVrWo8QrZKy"
              },
              "type": "syncNative"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ]
      }
    ],
    "logMessages": [
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: SetTokenLedger",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 3223 of 600000 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: AldrinV2Swap",
      "Program CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4 invoke [2]",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4736 of 519858 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: MintTo",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4541 of 455226 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 446292 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4 consumed 141023 of 581092 compute units",
      "Program CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4 success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 157729 of 596777 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: MarinadeFinanceLiquidUnstake",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD invoke [2]",
      "Program log: enter LiquidUnstake",
      "Program log: msol_fee 2369483391",
      "Program 11111111111111111111111111111111 invoke [3]",
      "Program 11111111111111111111111111111111 success",
      "Program log: treasury_msol_cut 1184741695",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 392672 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 384837 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD consumed 46082 of 419629 compute units",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD success",
      "Program 11111111111111111111111111111111 invoke [2]",
      "Program 11111111111111111111111111111111 success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
      "Program log: Instruction: SyncNative",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3045 of 370026 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 72899 of 439048 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success"
    ],
    "postBalances": [
      12070541465,
      2039280,
      2039280,
      2039280,
      19098240,
      2039280,
      1083426482075,
      1461600,
      1224960,
      1627689655756,
      0,
      2094555549,
      3290700213269,
      2039280,
      1,
      4189920,
      1141440,
      0,
      1002240,
      1141440,
      1141440,
      934087680
    ],
    "postTokenBalances": [
      {
        "accountIndex": 1,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "5788082271886",
          "decimals": 9,
          "uiAmount": 5788.082271886,
          "uiAmountString": "5788.082271886"
        }
      },
      {
        "accountIndex": 2,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "EyaSjUtSgo9aRD1f8LWXwdvkpDTmXAW54yoSHZRF14WL",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "133710053817704",
          "decimals": 9,
          "uiAmount": 133710.053817704,
          "uiAmountString": "133710.053817704"
        }
      },
      {
        "accountIndex": 3,
        "mint": "CCJ73enCHai27dS79uhqMYMGoehVQsP1YECyDq9xvyt9",
        "owner": "D7FkvSLw8rq8Ydh43tBViSQuST2sBczEStbWudFhR6L",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "48432186",
          "decimals": 0,
          "uiAmount": 48432186,
          "uiAmountString": "48432186"
        }
      },
      {
        "accountIndex": 5,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "89SrbjbuNyqSqAALKBsKBqMSh463eLvzS4iVWCeArBgB",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1107252111064",
          "decimals": 9,
          "uiAmount": 1107.252111064,
          "uiAmountString": "1107.252111064"
        }
      },
      {
        "accountIndex": 6,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1083424442795",
          "decimals": 9,
          "uiAmount": 1083.424442795,
          "uiAmountString": "1083.424442795"
        }
      },
      {
        "accountIndex": 9,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1627687616476",
          "decimals": 9,
          "uiAmount": 1627.687616476,
          "uiAmountString": "1627.687616476"
        }
      },
      {
        "accountIndex": 13,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "371972364197",
          "decimals": 9,
          "uiAmount": 371.972364197,
          "uiAmountString": "371.972364197"
        }
      }
    ],
    "preBalances": [
      12070546465,
      2039280,
      2039280,
      2039280,
      19098240,
      2039280,
      1078794201487,
      1461600,
      1224960,
      1547689655756,
      0,
      2094555549,
      3375332493857,
      2039280,
      1,
      4189920,
      1141440,
      0,
      1002240,
      1141440,
      1141440,
      934087680
    ],
    "preTokenBalances": [
      {
        "accountIndex": 1,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "5869228963360",
          "decimals": 9,
          "uiAmount": 5869.22896336,
          "uiAmountString": "5869.22896336"
        }
      },
      {
        "accountIndex": 2,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "EyaSjUtSgo9aRD1f8LWXwdvkpDTmXAW54yoSHZRF14WL",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "133630091867925",
          "decimals": 9,
          "uiAmount": 133630.091867925,
          "uiAmountString": "133630.091867925"
        }
      },
      {
        "accountIndex": 3,
        "mint": "CCJ73enCHai27dS79uhqMYMGoehVQsP1YECyDq9xvyt9",
        "owner": "D7FkvSLw8rq8Ydh43tBViSQuST2sBczEStbWudFhR6L",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "48403873",
          "decimals": 0,
          "uiAmount": 48403873,
          "uiAmountString": "48403873"
        }
      },
      {
        "accountIndex": 5,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "89SrbjbuNyqSqAALKBsKBqMSh463eLvzS4iVWCeArBgB",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1106067369369",
          "decimals": 9,
          "uiAmount": 1106.067369369,
          "uiAmountString": "1106.067369369"
        }
      },
      {
        "accountIndex": 6,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1078792162207",
          "decimals": 9,
          "uiAmount": 1078.792162207,
          "uiAmountString": "1078.792162207"
        }
      },
      {
        "accountIndex": 9,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1547687616476",
          "decimals": 9,
          "uiAmount": 1547.687616476,
          "uiAmountString": "1547.687616476"
        }
      },
      {
        "accountIndex": 13,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "371972364197",
          "decimals": 9,
          "uiAmount": 371.972364197,
          "uiAmountString": "371.972364197"
        }
      }
    ],
    "rewards": [],
    "status": {
      "Ok": null
    }
  },
  "slot": 160314338,
  "transaction": {
    "message": {
      "accountKeys": [
        {
          "pubkey": "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
          "signer": true,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "3VwacVEwZWLaGCjhWdkfnYhfLWMdfhRaoHJkouUVwKub",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "7sb4tQXXv2TzNMrFtxRyanQvyDUZQKC2JStYFCMzzBHV",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "Bu1WfCjd8xF3VhArDWf1CgiDu6r3dbmu5hVrWo8QrZKy",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "CCJ73enCHai27dS79uhqMYMGoehVQsP1YECyDq9xvyt9",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "CUNMrNvGNh1aWR6cVzAQekdsW2dfacnQicyfvgvrN5ap",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "FARYkuYJfe9putyXajbS3sAngXSMxk97kqRHT7iQhoV4",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "GSWtKpYiVaznEFGPn7P7XszQ5tUUwUiRzLkxxz58CcpU",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "11111111111111111111111111111111",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "2gCzKgSTPSy4fL7z9NQhJAKvumEofTa2DFJU4wGhQ5Jt",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "iwJtZ6XdRnss912F9JHotr18Tj5APj1xz29YEkzDeh8",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "signer": false,
          "source": "transaction",
          "writable": false
        }
      ],
      "addressTableLookups": null,
      "instructions": [
        {
          "accounts": [
            "CUNMrNvGNh1aWR6cVzAQekdsW2dfacnQicyfvgvrN5ap",
            "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm"
          ],
          "data": "fC8nMvWeAaD",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        },
        {
          "accounts": [
            "CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4",
            "2gCzKgSTPSy4fL7z9NQhJAKvumEofTa2DFJU4wGhQ5Jt",
            "DiZy5F8fHGgLkFMUkTwF1s2RwnFsjGwAXKF4GfEjvRB7",
            "CCJ73enCHai27dS79uhqMYMGoehVQsP1YECyDq9xvyt9",
            "3VwacVEwZWLaGCjhWdkfnYhfLWMdfhRaoHJkouUVwKub",
            "FARYkuYJfe9putyXajbS3sAngXSMxk97kqRHT7iQhoV4",
            "7sb4tQXXv2TzNMrFtxRyanQvyDUZQKC2JStYFCMzzBHV",
            "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
            "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm",
            "Bu1WfCjd8xF3VhArDWf1CgiDu6r3dbmu5hVrWo8QrZKy",
            "iwJtZ6XdRnss912F9JHotr18Tj5APj1xz29YEkzDeh8",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ],
          "data": "SmVxJQ35Gyo6jZVv3C1bkAsoyjWSUZwFgwRiw",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        },
        {
          "accounts": [
            "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
            "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
            "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q",
            "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
            "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
            "YoXbogSMxqtvdMQjshBvbT4Z5PZSCRMPa3F8STPDusm",
            "AasQTQH9oroodW5vi3uEoDuLyJDVfMz7GWehvisdGmDX",
            "GSWtKpYiVaznEFGPn7P7XszQ5tUUwUiRzLkxxz58CcpU",
            "11111111111111111111111111111111",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "Bu1WfCjd8xF3VhArDWf1CgiDu6r3dbmu5hVrWo8QrZKy",
            "CUNMrNvGNh1aWR6cVzAQekdsW2dfacnQicyfvgvrN5ap"
          ],
          "data": "849jMXV4j8Ldc9G5TMJn2G7LK",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        }
      ],
      "recentBlockhash": "FEvMCKmWXkHdG82b5rNzkc6VM4jkojMm8RHavEYvCGrH"
    },
    "signatures": [
      "64QzPJWyEshDCMatvSDuNmvndNzn3TJyyAMSmrLMQdbGJAEwmeVM19oNwY9KiS24jvaxNCqEhv33cL4BbmxnXPTf"
    ]
  },
  "version": "legacy"
}
`

  const txV0 = `{
  "blockTime": 1668090277,
  "meta": {
    "err": null,
    "fee": 5000,
    "innerInstructions": [
      {
        "index": 1,
        "instructions": [
          {
            "accounts": [
              "5ZKQc8pZMFnLneY4rj3SY5aVfv6wSsNPieiwKzX9uXES",
              "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
              "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
              "3hsU1VgsBgBgz5jWiqdw9RfGU6TpWdCmdah1oi4kF3Tq",
              "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56",
              "AjAAWprMW3WLLVvN1dptEaRy3P99kq1Ubng6xP16Vwib",
              "crRUdmsYY3zqHh7KtHuxQs3FUj1gSEnEavjMjbLjdRW",
              "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt",
              "Fj9n59ALXoQuePLMksjVuVCdkp9KiHBkSqt7r1u4YGuU",
              "7nK3EAFgAHAtdn6J1onuNEsiWJK4qXuUz5j5yxYE6GDu",
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ],
            "data": "aMAiQ77QdYsJuTdkmNy9aP",
            "programId": "CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh"
          },
          {
            "parsed": {
              "info": {
                "amount": "7336285",
                "authority": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
                "destination": "AjAAWprMW3WLLVvN1dptEaRy3P99kq1Ubng6xP16Vwib",
                "source": "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "amount": "7343",
                "authority": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
                "destination": "7nK3EAFgAHAtdn6J1onuNEsiWJK4qXuUz5j5yxYE6GDu",
                "source": "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "amount": "3070523",
                "authority": "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
                "destination": "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt",
                "source": "crRUdmsYY3zqHh7KtHuxQs3FUj1gSEnEavjMjbLjdRW"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ]
      },
      {
        "index": 2,
        "instructions": [
          {
            "accounts": [
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              "ABrn4ED4AvkQ79VAXqf7ooqicJPHhZDAbC9rqcQ8ePzz",
              "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
              "D7CHbxSFSiEW3sPc486AGDwuwsmyZqhP7stG4Yo9ZHTC",
              "5o8dopjEKEy491bVHShtG6KSSHKm2JUugVqKEK7Jw7YF",
              "FN3wMZUuWkM65ZtcnAoYpsq773YxrnMfM5iAroSGttBo",
              "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
              "6uGUx583UHvFKKCnoMfnGNEFxhSWy5iXXyea4o5E9dx7",
              "Gp7wpKu9mXpxdykMD9JKW5SK2Jw1h2fttxukvcL2dnW6",
              "4mkSxT9MaUsUd5uSkZxohf1pbPByk7b5ptWpu4ZABvto",
              "4dDEjb4JZejtweFEJjjqqC5wwZi3jqtzoS7cPNRyPoT6",
              "Geoh8p8j48Efupens8TqJKj491aqk5VhPXABFAqGtAjr",
              "EVv4jPvUxbugw8EHTDwkNBboE26DiN4Zy1CQrd5j3Sd4",
              "3ceGkbGkqQwjJsZEYzjykDcWM1FjzHGMNTyKHD1c7kqW",
              "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt",
              "6BCamgk7aDZPtE7k4Pon2E6qB4Qds4zcdqy5ntTfFEmu",
              "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd"
            ],
            "data": "62u7juuwUpfnp6i9mdAN3no",
            "programId": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
          },
          {
            "parsed": {
              "info": {
                "amount": "3070523",
                "authority": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
                "destination": "5o8dopjEKEy491bVHShtG6KSSHKm2JUugVqKEK7Jw7YF",
                "source": "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "amount": "123385",
                "authority": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
                "destination": "6BCamgk7aDZPtE7k4Pon2E6qB4Qds4zcdqy5ntTfFEmu",
                "source": "FN3wMZUuWkM65ZtcnAoYpsq773YxrnMfM5iAroSGttBo"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ]
      },
      {
        "index": 4,
        "instructions": [
          {
            "accounts": [
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              "ZfvDXXUhZDzDVsapffUyXHj9ByCoPjP4thL6YXcZ9ix",
              "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
              "4zoatXFjMSirW2niUNhekxqeEZujjC1oioKCEJQMLeWF",
              "8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck7xekuyADKL",
              "DaXyxj42ZDrp3mjrL9pYjPNyBp5P8A2f37am4Kd4EyrK",
              "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
              "6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy",
              "8qyWhEcpuvEsdCmY1kvEnkTfgGeWHmi73Mta5jgWDTuT",
              "PPnJy6No31U45SVSjWTr45R8Q73X6bNHfxdFqr2vMq3",
              "BC8Tdzz7rwvuYkJWKnPnyguva27PQP5DTxosHVQrEzg9",
              "2y3BtF5oRBpLwdoaGjLkfmT3FY3YbZCKPbA9zvvx8Pz7",
              "6w5hF2hceQRZbaxjPJutiWSPAFWDkp3YbY2Aq3RpCSKe",
              "9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96",
              "6BCamgk7aDZPtE7k4Pon2E6qB4Qds4zcdqy5ntTfFEmu",
              "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT",
              "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd"
            ],
            "data": "6HLGKf8EguWotDgAKUNKQWs",
            "programId": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
          },
          {
            "accounts": [
              "6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy",
              "8qyWhEcpuvEsdCmY1kvEnkTfgGeWHmi73Mta5jgWDTuT",
              "PPnJy6No31U45SVSjWTr45R8Q73X6bNHfxdFqr2vMq3",
              "4zoatXFjMSirW2niUNhekxqeEZujjC1oioKCEJQMLeWF",
              "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
              "BC8Tdzz7rwvuYkJWKnPnyguva27PQP5DTxosHVQrEzg9"
            ],
            "data": "13MavgsFLzHv6EcrrPwXaRHyNnWzdiB74PzXykdRhHUk52bUQ4TsBd6LbREcMNvWwrFZPb76t7zDwMtJU4ajemxfNHXL7h",
            "programId": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
          },
          {
            "parsed": {
              "info": {
                "amount": "114096",
                "authority": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
                "destination": "DaXyxj42ZDrp3mjrL9pYjPNyBp5P8A2f37am4Kd4EyrK",
                "source": "6BCamgk7aDZPtE7k4Pon2E6qB4Qds4zcdqy5ntTfFEmu"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "amount": "7047632",
                "authority": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
                "destination": "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT",
                "source": "8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck7xekuyADKL"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ]
      },
      {
        "index": 5,
        "instructions": [
          {
            "accounts": [
              "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
              "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
              "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q",
              "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
              "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
              "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT",
              "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
              "BNYShrC9SveM3WN1GdGfvVFnwJsfYGnerNyvNcF4f1WJ",
              "11111111111111111111111111111111",
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ],
            "data": "4iiUNUdSejS5xdkdExkFQB",
            "programId": "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD"
          },
          {
            "parsed": {
              "info": {
                "destination": "BNYShrC9SveM3WN1GdGfvVFnwJsfYGnerNyvNcF4f1WJ",
                "lamports": 7344301,
                "source": "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q"
              },
              "type": "transfer"
            },
            "program": "system",
            "programId": "11111111111111111111111111111111"
          },
          {
            "parsed": {
              "info": {
                "amount": "6941918",
                "authority": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
                "destination": "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
                "source": "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "amount": "105714",
                "authority": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
                "destination": "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
                "source": "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT"
              },
              "type": "transfer"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "parsed": {
              "info": {
                "destination": "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56",
                "lamports": 7344301,
                "source": "BNYShrC9SveM3WN1GdGfvVFnwJsfYGnerNyvNcF4f1WJ"
              },
              "type": "transfer"
            },
            "program": "system",
            "programId": "11111111111111111111111111111111"
          },
          {
            "parsed": {
              "info": {
                "account": "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56"
              },
              "type": "syncNative"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ]
      }
    ],
    "logMessages": [
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: SetTokenLedger",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 3223 of 1200000 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: CropperTokenSwap",
      "Program CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh invoke [2]",
      "Program log: Instruction: Swap",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4736 of 1162638 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4736 of 1155030 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 1147422 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh consumed 39155 of 1181064 compute units",
      "Program CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 55881 of 1196777 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: RaydiumSwapV2",
      "Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 invoke [2]",
      "Program log: calc_exact len:0",
      "Program consumption: 1101099 units remaining",
      "Program consumption: 1100991 units remaining",
      "Program log: ray_log: AzvaLgAAAAAAAAAAAAAAAAACAAAAAAAAAHLaLgAAAAAA9ryaXAIAAAAGE10YAAAAAPnhAQAAAAAA",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 1094602 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 1087050 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 consumed 30751 of 1112384 compute units",
      "Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 60721 of 1140896 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: SetTokenLedger",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 3223 of 1080175 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: RaydiumSwapV2",
      "Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 invoke [2]",
      "Program log: calc_exact len:17",
      "Program consumption: 1016326 units remaining",
      "Program consumption: 1014661 units remaining",
      "Program log: ray_log: A7C9AQAAAAAAAAAAAAAAAAABAAAAAAAAAAeU4QEAAAAA7y5dK0oIAAAeGC1FIgAAANCJawAAAAAA",
      "Program 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin invoke [3]",
      "Program 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin consumed 13194 of 1004400 compute units",
      "Program 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 988272 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 980720 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 consumed 75034 of 1050334 compute units",
      "Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8 success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 103076 of 1076952 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph invoke [1]",
      "Program log: Instruction: MarinadeFinanceLiquidUnstake",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD invoke [2]",
      "Program log: enter LiquidUnstake",
      "Program log: msol_fee 211428",
      "Program 11111111111111111111111111111111 invoke [3]",
      "Program 11111111111111111111111111111111 success",
      "Program log: treasury_msol_cut 105714",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 929095 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
      "Program log: Instruction: Transfer",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 921260 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD consumed 44487 of 954457 compute units",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD success",
      "Program 11111111111111111111111111111111 invoke [2]",
      "Program 11111111111111111111111111111111 success",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
      "Program log: Instruction: SyncNative",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3045 of 906449 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph consumed 71304 of 973876 compute units",
      "Program JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph success"
    ],
    "postBalances": [
      5727089821,
      23370632448,
      2039280,
      1461600,
      19098240,
      2094555549,
      113500456,
      2039280,
      2039280,
      0,
      1141440,
      2916240,
      0,
      1141440,
      2039280,
      10612384,
      7377134567,
      6124800,
      23357760,
      2039280,
      2039280,
      3591360,
      457104960,
      457104960,
      1825496640,
      2039280,
      2039280,
      4078560,
      1224960,
      2039280,
      6124800,
      23357760,
      2039280,
      2039280,
      3591360,
      457104960,
      457104960,
      1825496640,
      2039280,
      2039280,
      1224960,
      1141440,
      934087680,
      1795680,
      1141440,
      63947944,
      1141440,
      0,
      0,
      1
    ],
    "postTokenBalances": [
      {
        "accountIndex": 1,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "23368593168",
          "decimals": 9,
          "uiAmount": 23.368593168,
          "uiAmountString": "23.368593168"
        }
      },
      {
        "accountIndex": 2,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "9797216138",
          "decimals": 6,
          "uiAmount": 9797.216138,
          "uiAmountString": "9797.216138"
        }
      },
      {
        "accountIndex": 7,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "EyaSjUtSgo9aRD1f8LWXwdvkpDTmXAW54yoSHZRF14WL",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "126200731391852",
          "decimals": 9,
          "uiAmount": 126200.731391852,
          "uiAmountString": "126200.731391852"
        }
      },
      {
        "accountIndex": 8,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "89SrbjbuNyqSqAALKBsKBqMSh463eLvzS4iVWCeArBgB",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1000175163393",
          "decimals": 9,
          "uiAmount": 1000.175163393,
          "uiAmountString": "1000.175163393"
        }
      },
      {
        "accountIndex": 14,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "55",
          "decimals": 6,
          "uiAmount": 0.000055,
          "uiAmountString": "0.000055"
        }
      },
      {
        "accountIndex": 15,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "8573104",
          "decimals": 9,
          "uiAmount": 0.008573104,
          "uiAmountString": "0.008573104"
        }
      },
      {
        "accountIndex": 16,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "DyDdJM9KVsvosfXbcHDp4pRpmbMHkRq3pcarBykPy4ir",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "7375095287",
          "decimals": 9,
          "uiAmount": 7.375095287,
          "uiAmountString": "7.375095287"
        }
      },
      {
        "accountIndex": 19,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "10243491015",
          "decimals": 6,
          "uiAmount": 10243.491015,
          "uiAmountString": "10243.491015"
        }
      },
      {
        "accountIndex": 20,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "543450213",
          "decimals": 6,
          "uiAmount": 543.450213,
          "uiAmountString": "543.450213"
        }
      },
      {
        "accountIndex": 25,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "3ceGkbGkqQwjJsZEYzjykDcWM1FjzHGMNTyKHD1c7kqW",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "0",
          "decimals": 6,
          "uiAmount": null,
          "uiAmountString": "0"
        }
      },
      {
        "accountIndex": 26,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "3ceGkbGkqQwjJsZEYzjykDcWM1FjzHGMNTyKHD1c7kqW",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "15824867",
          "decimals": 6,
          "uiAmount": 15.824867,
          "uiAmountString": "15.824867"
        }
      },
      {
        "accountIndex": 27,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "31446615",
          "decimals": 6,
          "uiAmount": 31.446615,
          "uiAmountString": "31.446615"
        }
      },
      {
        "accountIndex": 29,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "33297071",
          "decimals": 9,
          "uiAmount": 0.033297071,
          "uiAmountString": "0.033297071"
        }
      },
      {
        "accountIndex": 32,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "4895691734203",
          "decimals": 9,
          "uiAmount": 4895.691734203,
          "uiAmountString": "4895.691734203"
        }
      },
      {
        "accountIndex": 33,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "147013253885",
          "decimals": 6,
          "uiAmount": 147013.253885,
          "uiAmountString": "147013.253885"
        }
      },
      {
        "accountIndex": 38,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "28284731000000",
          "decimals": 9,
          "uiAmount": 28284.731,
          "uiAmountString": "28284.731"
        }
      },
      {
        "accountIndex": 39,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "542875585856",
          "decimals": 6,
          "uiAmount": 542875.585856,
          "uiAmountString": "542875.585856"
        }
      }
    ],
    "preBalances": [
      5727094821,
      23363296163,
      2039280,
      1461600,
      19098240,
      2094555549,
      120844757,
      2039280,
      2039280,
      0,
      1141440,
      2916240,
      0,
      1141440,
      2039280,
      10611711,
      7377127224,
      6124800,
      23357760,
      2039280,
      2039280,
      3591360,
      457104960,
      457104960,
      1825496640,
      2039280,
      2039280,
      4078560,
      1224960,
      2039280,
      6124800,
      23357760,
      2039280,
      2039280,
      3591360,
      457104960,
      457104960,
      1825496640,
      2039280,
      2039280,
      1224960,
      1141440,
      934087680,
      1795680,
      1141440,
      63947944,
      1141440,
      0,
      0,
      1
    ],
    "preTokenBalances": [
      {
        "accountIndex": 1,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "23361256883",
          "decimals": 9,
          "uiAmount": 23.361256883,
          "uiAmountString": "23.361256883"
        }
      },
      {
        "accountIndex": 2,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "9800286661",
          "decimals": 6,
          "uiAmount": 9800.286661,
          "uiAmountString": "9800.286661"
        }
      },
      {
        "accountIndex": 7,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "EyaSjUtSgo9aRD1f8LWXwdvkpDTmXAW54yoSHZRF14WL",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "126200724449934",
          "decimals": 9,
          "uiAmount": 126200.724449934,
          "uiAmountString": "126200.724449934"
        }
      },
      {
        "accountIndex": 8,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "89SrbjbuNyqSqAALKBsKBqMSh463eLvzS4iVWCeArBgB",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1000175057679",
          "decimals": 9,
          "uiAmount": 1000.175057679,
          "uiAmountString": "1000.175057679"
        }
      },
      {
        "accountIndex": 14,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "55",
          "decimals": 6,
          "uiAmount": 0.000055,
          "uiAmountString": "0.000055"
        }
      },
      {
        "accountIndex": 15,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "8572431",
          "decimals": 9,
          "uiAmount": 0.008572431,
          "uiAmountString": "0.008572431"
        }
      },
      {
        "accountIndex": 16,
        "mint": "So11111111111111111111111111111111111111112",
        "owner": "DyDdJM9KVsvosfXbcHDp4pRpmbMHkRq3pcarBykPy4ir",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "7375087944",
          "decimals": 9,
          "uiAmount": 7.375087944,
          "uiAmountString": "7.375087944"
        }
      },
      {
        "accountIndex": 19,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "10240420492",
          "decimals": 6,
          "uiAmount": 10240.420492,
          "uiAmountString": "10240.420492"
        }
      },
      {
        "accountIndex": 20,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "543573598",
          "decimals": 6,
          "uiAmount": 543.573598,
          "uiAmountString": "543.573598"
        }
      },
      {
        "accountIndex": 25,
        "mint": "xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW",
        "owner": "3ceGkbGkqQwjJsZEYzjykDcWM1FjzHGMNTyKHD1c7kqW",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "0",
          "decimals": 6,
          "uiAmount": null,
          "uiAmountString": "0"
        }
      },
      {
        "accountIndex": 26,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "3ceGkbGkqQwjJsZEYzjykDcWM1FjzHGMNTyKHD1c7kqW",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "15824867",
          "decimals": 6,
          "uiAmount": 15.824867,
          "uiAmountString": "15.824867"
        }
      },
      {
        "accountIndex": 27,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "31437326",
          "decimals": 6,
          "uiAmount": 31.437326,
          "uiAmountString": "31.437326"
        }
      },
      {
        "accountIndex": 29,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "33297071",
          "decimals": 9,
          "uiAmount": 0.033297071,
          "uiAmountString": "0.033297071"
        }
      },
      {
        "accountIndex": 32,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "4895698781835",
          "decimals": 9,
          "uiAmount": 4895.698781835,
          "uiAmountString": "4895.698781835"
        }
      },
      {
        "accountIndex": 33,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "147013139789",
          "decimals": 6,
          "uiAmount": 147013.139789,
          "uiAmountString": "147013.139789"
        }
      },
      {
        "accountIndex": 38,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "28284731000000",
          "decimals": 9,
          "uiAmount": 28284.731,
          "uiAmountString": "28284.731"
        }
      },
      {
        "accountIndex": 39,
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "owner": "9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "542875585856",
          "decimals": 6,
          "uiAmount": 542875.585856,
          "uiAmountString": "542875.585856"
        }
      }
    ],
    "rewards": [],
    "status": {
      "Ok": null
    }
  },
  "slot": 160313297,
  "transaction": {
    "message": {
      "accountKeys": [
        {
          "pubkey": "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
          "signer": true,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "AjAAWprMW3WLLVvN1dptEaRy3P99kq1Ubng6xP16Vwib",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "crRUdmsYY3zqHh7KtHuxQs3FUj1gSEnEavjMjbLjdRW",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "Fj9n59ALXoQuePLMksjVuVCdkp9KiHBkSqt7r1u4YGuU",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "BNYShrC9SveM3WN1GdGfvVFnwJsfYGnerNyvNcF4f1WJ",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "5ZKQc8pZMFnLneY4rj3SY5aVfv6wSsNPieiwKzX9uXES",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "7nK3EAFgAHAtdn6J1onuNEsiWJK4qXuUz5j5yxYE6GDu",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "ABrn4ED4AvkQ79VAXqf7ooqicJPHhZDAbC9rqcQ8ePzz",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "D7CHbxSFSiEW3sPc486AGDwuwsmyZqhP7stG4Yo9ZHTC",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "5o8dopjEKEy491bVHShtG6KSSHKm2JUugVqKEK7Jw7YF",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "FN3wMZUuWkM65ZtcnAoYpsq773YxrnMfM5iAroSGttBo",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "6uGUx583UHvFKKCnoMfnGNEFxhSWy5iXXyea4o5E9dx7",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "Gp7wpKu9mXpxdykMD9JKW5SK2Jw1h2fttxukvcL2dnW6",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "4mkSxT9MaUsUd5uSkZxohf1pbPByk7b5ptWpu4ZABvto",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "4dDEjb4JZejtweFEJjjqqC5wwZi3jqtzoS7cPNRyPoT6",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "Geoh8p8j48Efupens8TqJKj491aqk5VhPXABFAqGtAjr",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "EVv4jPvUxbugw8EHTDwkNBboE26DiN4Zy1CQrd5j3Sd4",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "6BCamgk7aDZPtE7k4Pon2E6qB4Qds4zcdqy5ntTfFEmu",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "3HmXTbZf6G2oEjN3bPreZmF7YGLbbEXFkgAbVFPaimwU",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "ZfvDXXUhZDzDVsapffUyXHj9ByCoPjP4thL6YXcZ9ix",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "4zoatXFjMSirW2niUNhekxqeEZujjC1oioKCEJQMLeWF",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck7xekuyADKL",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "DaXyxj42ZDrp3mjrL9pYjPNyBp5P8A2f37am4Kd4EyrK",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "8qyWhEcpuvEsdCmY1kvEnkTfgGeWHmi73Mta5jgWDTuT",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "PPnJy6No31U45SVSjWTr45R8Q73X6bNHfxdFqr2vMq3",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "BC8Tdzz7rwvuYkJWKnPnyguva27PQP5DTxosHVQrEzg9",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "2y3BtF5oRBpLwdoaGjLkfmT3FY3YbZCKPbA9zvvx8Pz7",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "6w5hF2hceQRZbaxjPJutiWSPAFWDkp3YbY2Aq3RpCSKe",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "5ZZ7w2C1c348nQm4zaYgrgb8gfyyqQNzH61zPwGvEQK9",
          "signer": false,
          "source": "lookupTable",
          "writable": true
        },
        {
          "pubkey": "CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "3hsU1VgsBgBgz5jWiqdw9RfGU6TpWdCmdah1oi4kF3Tq",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "3ceGkbGkqQwjJsZEYzjykDcWM1FjzHGMNTyKHD1c7kqW",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        },
        {
          "pubkey": "11111111111111111111111111111111",
          "signer": false,
          "source": "lookupTable",
          "writable": false
        }
      ],
      "addressTableLookups": [
        {
          "accountKey": "CqsKYwg126YXswXQzs2erRDQ82q52N5iogjdb51GYcta",
          "readonlyIndexes": [
            38,
            31,
            40,
            34,
            35,
            36,
            227,
            134
          ],
          "writableIndexes": [
            199,
            18,
            24,
            200,
            201,
            202,
            203,
            204,
            205,
            206,
            207,
            208,
            209,
            3,
            44,
            82,
            115,
            116,
            117,
            118,
            119,
            120,
            121,
            122,
            123,
            124
          ]
        },
        {
          "accountKey": "4gL2msS3waPN2qSf4yAkRKXF2DZ9MrDjCqQzqeHUgYzy",
          "readonlyIndexes": [],
          "writableIndexes": [
            55
          ]
        },
        {
          "accountKey": "2BeCEmG8hWWJseLJFg7b9LHAvXcXCGteaYqgWNYDrFw5",
          "readonlyIndexes": [
            16
          ],
          "writableIndexes": []
        }
      ],
      "instructions": [
        {
          "accounts": [
            "5ZZ7w2C1c348nQm4zaYgrgb8gfyyqQNzH61zPwGvEQK9",
            "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt"
          ],
          "data": "fC8nMvWeAaD",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        },
        {
          "accounts": [
            "CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "5ZKQc8pZMFnLneY4rj3SY5aVfv6wSsNPieiwKzX9uXES",
            "3hsU1VgsBgBgz5jWiqdw9RfGU6TpWdCmdah1oi4kF3Tq",
            "9kwXN9v5oWZwr3kcKEDhi7VALtmiFsN24yWXBcqLMLVi",
            "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
            "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56",
            "AjAAWprMW3WLLVvN1dptEaRy3P99kq1Ubng6xP16Vwib",
            "crRUdmsYY3zqHh7KtHuxQs3FUj1gSEnEavjMjbLjdRW",
            "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt",
            "Fj9n59ALXoQuePLMksjVuVCdkp9KiHBkSqt7r1u4YGuU",
            "7nK3EAFgAHAtdn6J1onuNEsiWJK4qXuUz5j5yxYE6GDu"
          ],
          "data": "67rtoxAUDmnWMYszeMdqQVPQrMBMJoQxzYJK",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        },
        {
          "accounts": [
            "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "ABrn4ED4AvkQ79VAXqf7ooqicJPHhZDAbC9rqcQ8ePzz",
            "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
            "D7CHbxSFSiEW3sPc486AGDwuwsmyZqhP7stG4Yo9ZHTC",
            "5o8dopjEKEy491bVHShtG6KSSHKm2JUugVqKEK7Jw7YF",
            "FN3wMZUuWkM65ZtcnAoYpsq773YxrnMfM5iAroSGttBo",
            "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
            "6uGUx583UHvFKKCnoMfnGNEFxhSWy5iXXyea4o5E9dx7",
            "Gp7wpKu9mXpxdykMD9JKW5SK2Jw1h2fttxukvcL2dnW6",
            "4mkSxT9MaUsUd5uSkZxohf1pbPByk7b5ptWpu4ZABvto",
            "4dDEjb4JZejtweFEJjjqqC5wwZi3jqtzoS7cPNRyPoT6",
            "Geoh8p8j48Efupens8TqJKj491aqk5VhPXABFAqGtAjr",
            "EVv4jPvUxbugw8EHTDwkNBboE26DiN4Zy1CQrd5j3Sd4",
            "3ceGkbGkqQwjJsZEYzjykDcWM1FjzHGMNTyKHD1c7kqW",
            "7mycMafNLB4XC4KhTPKj2ohfqbzFxQrr316ZATZRnDgt",
            "6BCamgk7aDZPtE7k4Pon2E6qB4Qds4zcdqy5ntTfFEmu",
            "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
            "5ZZ7w2C1c348nQm4zaYgrgb8gfyyqQNzH61zPwGvEQK9"
          ],
          "data": "3u8Qvku9ABNoViFiv4i1AocxX",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        },
        {
          "accounts": [
            "3HmXTbZf6G2oEjN3bPreZmF7YGLbbEXFkgAbVFPaimwU",
            "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT"
          ],
          "data": "fC8nMvWeAaD",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        },
        {
          "accounts": [
            "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "ZfvDXXUhZDzDVsapffUyXHj9ByCoPjP4thL6YXcZ9ix",
            "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
            "4zoatXFjMSirW2niUNhekxqeEZujjC1oioKCEJQMLeWF",
            "8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck7xekuyADKL",
            "DaXyxj42ZDrp3mjrL9pYjPNyBp5P8A2f37am4Kd4EyrK",
            "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
            "6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy",
            "8qyWhEcpuvEsdCmY1kvEnkTfgGeWHmi73Mta5jgWDTuT",
            "PPnJy6No31U45SVSjWTr45R8Q73X6bNHfxdFqr2vMq3",
            "BC8Tdzz7rwvuYkJWKnPnyguva27PQP5DTxosHVQrEzg9",
            "2y3BtF5oRBpLwdoaGjLkfmT3FY3YbZCKPbA9zvvx8Pz7",
            "6w5hF2hceQRZbaxjPJutiWSPAFWDkp3YbY2Aq3RpCSKe",
            "9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96",
            "6BCamgk7aDZPtE7k4Pon2E6qB4Qds4zcdqy5ntTfFEmu",
            "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT",
            "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd"
          ],
          "data": "3987sfmq8Uv3DpyguYSvZwmLQWuUGDdiVVmh",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        },
        {
          "accounts": [
            "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
            "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
            "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q",
            "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
            "B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR",
            "GB8adXozfyZ7ViSQQgtBt11cgJA9hY6mUbsdgG5KF7rT",
            "GmpYXccij2PcQCsWrBhnNDttHotNSqqeTTdvaT2wvrMd",
            "BNYShrC9SveM3WN1GdGfvVFnwJsfYGnerNyvNcF4f1WJ",
            "11111111111111111111111111111111",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "CHKeq9PhZHNf3bWswTju27u3euyBhYUzad3SabWq6r56",
            "3HmXTbZf6G2oEjN3bPreZmF7YGLbbEXFkgAbVFPaimwU"
          ],
          "data": "849jMXV4j8LdbJTANgD9aDcoy",
          "programId": "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph"
        }
      ],
      "recentBlockhash": "EtTGbyNE7q9gzNAiewweo5P64qU3H3iPPDHrSC4yrQpb"
    },
    "signatures": [
      "64Arh7PuCUQdAZPE8AJUirBotYkCAPugzcu6opL4opXsjgmYFY8tcipTRv5SwqZuFNwcEw4MVw4qKuGF6NGfY1WU"
    ]
  },
  "version": 0
}
`

  const tx = `{
  "blockTime": 1667836100,
  "meta": {
    "err": null,
    "fee": 10000,
    "innerInstructions": [
      {
        "index": 1,
        "instructions": [
          {
            "parsed": {
              "info": {
                "account": "751t72jfqz6fFQuTC9UHzCsx5Lpo1wdEqmHV9dWbKbTW",
                "amount": "1165171360",
                "authority": "BbAHp6ruxUkT9c1v98PuFuuaJQ2YFgcHe1ghGPED4Y3i",
                "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
              },
              "type": "burn"
            },
            "program": "spl-token",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ]
      }
    ],
    "logMessages": [
      "Program 11111111111111111111111111111111 invoke [1]",
      "Program 11111111111111111111111111111111 success",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD invoke [1]",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
      "Program log: Instruction: Burn",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4800 of 382342 compute units",
      "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD consumed 29711 of 400000 compute units",
      "Program MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD success"
    ],
    "postBalances": [
      3844455611,
      1503360,
      2039280,
      19098240,
      2094555549,
      1,
      1141440,
      1169280,
      1009200,
      934087680
    ],
    "postTokenBalances": [
      {
        "accountIndex": 2,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "BbAHp6ruxUkT9c1v98PuFuuaJQ2YFgcHe1ghGPED4Y3i",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "0",
          "decimals": 9,
          "uiAmount": null,
          "uiAmountString": "0"
        }
      }
    ],
    "preBalances": [
      3845968971,
      0,
      2039280,
      19098240,
      2094555549,
      1,
      1141440,
      1169280,
      1009200,
      934087680
    ],
    "preTokenBalances": [
      {
        "accountIndex": 2,
        "mint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "owner": "BbAHp6ruxUkT9c1v98PuFuuaJQ2YFgcHe1ghGPED4Y3i",
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "uiTokenAmount": {
          "amount": "1165171360",
          "decimals": 9,
          "uiAmount": 1.16517136,
          "uiAmountString": "1.16517136"
        }
      }
    ],
    "rewards": [],
    "status": {
      "Ok": null
    }
  },
  "slot": 159814698,
  "transaction": {
    "message": {
      "accountKeys": [
        {
          "pubkey": "BbAHp6ruxUkT9c1v98PuFuuaJQ2YFgcHe1ghGPED4Y3i",
          "signer": true,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "DphAzdHtKRxHxXSPjxYPwV5dwhsLVp86r9RnLLcYHLg2",
          "signer": true,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "751t72jfqz6fFQuTC9UHzCsx5Lpo1wdEqmHV9dWbKbTW",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
          "signer": false,
          "source": "transaction",
          "writable": true
        },
        {
          "pubkey": "11111111111111111111111111111111",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "SysvarC1ock11111111111111111111111111111111",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "SysvarRent111111111111111111111111111111111",
          "signer": false,
          "source": "transaction",
          "writable": false
        },
        {
          "pubkey": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "signer": false,
          "source": "transaction",
          "writable": false
        }
      ],
      "addressTableLookups": null,
      "instructions": [
        {
          "parsed": {
            "info": {
              "lamports": 1503360,
              "newAccount": "DphAzdHtKRxHxXSPjxYPwV5dwhsLVp86r9RnLLcYHLg2",
              "owner": "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
              "source": "BbAHp6ruxUkT9c1v98PuFuuaJQ2YFgcHe1ghGPED4Y3i",
              "space": 88
            },
            "type": "createAccount"
          },
          "program": "system",
          "programId": "11111111111111111111111111111111"
        },
        {
          "accounts": [
            "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC",
            "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            "751t72jfqz6fFQuTC9UHzCsx5Lpo1wdEqmHV9dWbKbTW",
            "BbAHp6ruxUkT9c1v98PuFuuaJQ2YFgcHe1ghGPED4Y3i",
            "DphAzdHtKRxHxXSPjxYPwV5dwhsLVp86r9RnLLcYHLg2",
            "SysvarC1ock11111111111111111111111111111111",
            "SysvarRent111111111111111111111111111111111",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ],
          "data": "D4QoZ9QytqaDY8CFubkmeP",
          "programId": "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD"
        }
      ],
      "recentBlockhash": "B7L4Ldi21oSy4GYdFxEUzaAhatvgKQhfv4oz3s4HVBrH"
    },
    "signatures": [
      "2XaL2jqiFM69nRGSu3Zxbj955e4cjWT8EduKuXUEsGCXW8zrPiznNS9bpgdNbe1YBGVVRDB9ei9c4swYu2RiGaZ4",
      "3tJWgW5f11Bt1utGvmzBwZgYYP5hzkBvceAyoieR6FL1zAEU3hMie92w1pok1BP9GD23MvfJjAenBaRHmS8kmiA6"
    ]
  }
}
`
  const layoutTest = `import {InstructionParserLibrary} from "@aleph-indexer/framework/dist/src/services/parser/src/instructionParserLibrary.js";
import path from "path";
import {TransactionParser} from "@aleph-indexer/framework/dist/src/services/parser/src/transactionParser.js";
import txn from "../__mocks__/txn.json";
import txn_legacy from "../__mocks__/txn_legacy.json";
import txn_v0 from "../__mocks__/txn_v0.json";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const layoutPath = path.join(__dirname, '../layout.js')
let instructionParserLibrary: InstructionParserLibrary
let transactionParser: TransactionParser

beforeAll(() => {
  instructionParserLibrary = new InstructionParserLibrary(layoutPath)
  transactionParser = new TransactionParser(instructionParserLibrary)
})

describe('TransactionParser', () => {
  it('parses a simple transaction', async () => {
    const parsedTxn = await transactionParser.parse(txn as unknown as any)
    expect(parsedTxn).toMatchSnapshot()
  })

  it('parses a legacy transaction', async () => {
    const parsedTxn = await transactionParser.parse(txn_legacy as unknown as any)
    expect(parsedTxn).toMatchSnapshot()
  })

  it('parses a v0 transaction', async () => {
    const parsedTxn = await transactionParser.parse(txn_v0 as unknown as any)
    expect(parsedTxn).toMatchSnapshot()
  })
})`

  return [
    accountLayouts,
    ixLayouts,
    indexLayouts,
    layoutLayouts,
    txLegacy,
    txV0,
    tx,
    layoutTest,
  ]
}

function isPubkey(type: string): boolean {
  return type === 'PublicKey'
}
function isBN(type: string): boolean {
  return type === 'BN'
}
