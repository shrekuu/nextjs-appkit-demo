import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, bsc, bscTestnet, arbitrum, sepolia, solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { SolanaAdapter } from '@reown/appkit-adapter-solana'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, bsc, bscTestnet, arbitrum, sepolia, solana, solanaTestnet, solanaDevnet]

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694"; // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// 1. Create the Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks
})

// 2. Create Solana adapter
export const solanaWeb3JsAdapter = new SolanaAdapter()


// export const networks = [mainnet, bsc] as [AppKitNetwork, ...AppKitNetwork[]];


//Set up the Wagmi Adapter (Config)
// export const wagmiAdapter = new WagmiAdapter({
//   storage: createStorage({
//     storage: cookieStorage,
//   }),
//   ssr: true,
//   projectId,
//   networks,
// });

// export const config = wagmiAdapter.wagmiConfig;
