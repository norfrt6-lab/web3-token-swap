import type { Metadata } from "next";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Token Swap | Web3 Demo",
  description: "A minimal Web3 token swap interface on Sepolia testnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
