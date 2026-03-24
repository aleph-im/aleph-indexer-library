import { ChainsConfig } from './schema.js'

export const defaultChainsConfig: ChainsConfig = {
  ethereum: {
    tokenContracts: {
      USDC: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
      },
      ALEPH: {
        address: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
        decimals: 18,
      },
    },
    creditContract: {
      address: '0x6b55F32Ea969910838defd03746Ced5E2AE8cB8B',
      nativePayments: true,
    },
    providers: {
      TRANSAK: ['0x085Ee67132Ec4297b85ed5d1b4C65424D36fDA7d'],
    },
  },
  'ethereum-sepolia': {
    tokenContracts: {
      USDC: {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        decimals: 6,
      },
      ALEPH: {
        address: '0x4b3f52fFF693D898578f132f0222877848E09A8C',
        decimals: 18,
      },
    },
    creditContract: {
      address: '0x4AFe3778bEC7ebC0499d4C755dE732b507B029A4',
      nativePayments: true,
    },
    providers: {
      TRANSAK: ['0x5930712f5Ad2752D35bAeB2c295F7B49aD459d27'],
    },
  },
}
