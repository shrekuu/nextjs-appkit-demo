import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // ref: https://github.com/WalletConnect/walletconnect-monorepo/issues/1908#issuecomment-1487801131
    // walletconnect: 'pino-pretty', 'lokijs', 'encoding' are not supported in the browser
    config.externals = [...config.externals, "pino-pretty", "lokijs", "encoding"];

    return config;
  },
  eslint: {
    // disable linting during build phase
    ignoreDuringBuilds: true,
  },
  typescript: {
    // disable type-checking during build phase
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
