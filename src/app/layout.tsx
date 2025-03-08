import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers"; // added
import WagmiProvider from "@/wagmi/provider";

export const metadata: Metadata = {
  title: "AppKit Example App",
  description: "Powered by WalletConnect",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const rawCookie = headersList.get("cookie");

  return (
    <html lang="en">
      <body>
        <WagmiProvider cookies={rawCookie}>{children}</WagmiProvider>
      </body>
    </html>
  );
}
