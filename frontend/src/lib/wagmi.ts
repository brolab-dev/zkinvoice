import { http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { type Chain } from "viem";

// Define Mantle Testnet (Sepolia)
export const mantleTestnet: Chain = {
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle Explorer",
      url: "https://sepolia.mantlescan.xyz",
    },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: "ZK Invoice Platform",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [mantleTestnet, sepolia, mainnet],
  transports: {
    [mantleTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

// Contract addresses (Mantle Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
  mantleTestnet: {
    invoiceManager: process.env.NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS || "0x06e56a9A77a226733e6122a5254d87F7485BD7C1",
    zkKYCRegistry: process.env.NEXT_PUBLIC_ZK_KYC_REGISTRY_ADDRESS || "0x66945d47d4f2b582E6dEc601d4f7E3ebd50d7230",
    kycVerifier: process.env.NEXT_PUBLIC_KYC_VERIFIER_ADDRESS || "0x4ee40b8851e87294712Ff498d2eccb481004BA09",
  },
};

