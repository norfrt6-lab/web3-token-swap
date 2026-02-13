import { ethers } from "ethers";
import { CHAIN_CONFIG } from "@/constants";

const RPC_TIMEOUT_MS = 10_000;

let providerInstance: ethers.JsonRpcProvider | null = null;
let providerRpcUrl: string | null = null;

/**
 * Returns a client-side JSON-RPC provider.
 * Recreates the singleton if the RPC URL has changed (relevant in tests).
 */
export function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = CHAIN_CONFIG.rpcUrl;
  if (!rpcUrl) {
    throw new Error("RPC URL not configured. Set NEXT_PUBLIC_SEPOLIA_RPC_URL in .env.local");
  }

  if (!providerInstance || providerRpcUrl !== rpcUrl) {
    providerInstance = new ethers.JsonRpcProvider(rpcUrl);
    providerRpcUrl = rpcUrl;
  }
  return providerInstance;
}

/**
 * Server-side provider uses the non-public env var
 * to keep API keys out of the client bundle.
 */
export function getServerProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("SEPOLIA_RPC_URL not configured on server");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}

/** Reset singleton — only for testing. */
export function _resetProvider(): void {
  providerInstance = null;
  providerRpcUrl = null;
}

export { RPC_TIMEOUT_MS };
