"use client";

import { wagmiAdapter, projectId, networks, solanaWeb3JsAdapter } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { AppSIWX } from "./AppSIWX";
import { DefaultSIWX, EIP155Verifier, SolanaVerifier } from "@reown/appkit-siwx";
import { siwx } from "./siwx";

// Set up queryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: "nextjs-appkit-demo",
  description: "AppKit Example",
  url: "https://nextjs-appkit-demo.projects.linwise.com", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter ],
  projectId,
  networks,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    send: false,
    swaps: false,
    onramp: false,
    history: false,
    connectMethodsOrder: ["wallet"],
  },
  featuredWalletIds: [
    "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709", // okx wallet
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // metamask wallet
    "8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4", // binance wallet
  ],
  excludeWalletIds: [
    // "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709", // okx wallet
    // "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // metamask wallet
    // "8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4", // binance wallet
  ],
  enableWalletConnect: true,
  allWallets: "SHOW", // "SHOW" | "HIDE" | "ONLY_MOBILE"
  termsConditionsUrl: "/legal/terms-of-service",
  privacyPolicyUrl: "/legal/privacy-policy",
  themeVariables: {
    "--w3m-accent": "#000000",
  },
  // siwx: new AppSIWX(),
  siwx: siwx,
  debug: true,
});

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
