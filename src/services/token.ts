import { ethers } from "ethers";
import { ERC20_ABI } from "@/constants";
import { getProvider, RPC_TIMEOUT_MS } from "./provider";
import type { TokenMetadata } from "@/types";
import { isValidAddress } from "@/lib/validation";

function getErc20Contract(address: string, provider?: ethers.JsonRpcProvider): ethers.Contract {
  return new ethers.Contract(address, ERC20_ABI, provider ?? getProvider());
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}: request timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export async function fetchTokenMetadata(
  address: string,
  provider?: ethers.JsonRpcProvider,
): Promise<TokenMetadata> {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid ERC-20 address: ${address}`);
  }

  const contract = getErc20Contract(address, provider);

  try {
    const [name, symbol, decimals] = await withTimeout(
      Promise.all([
        contract.name() as Promise<string>,
        contract.symbol() as Promise<string>,
        contract.decimals() as Promise<bigint>,
      ]),
      RPC_TIMEOUT_MS,
      `fetchTokenMetadata(${address})`,
    );

    return {
      address,
      name,
      symbol,
      decimals: Number(decimals),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fetch token metadata for ${address}: ${message}`);
  }
}

export async function fetchBalance(
  tokenAddress: string,
  walletAddress: string,
): Promise<string> {
  if (!isValidAddress(tokenAddress) || !isValidAddress(walletAddress)) {
    throw new Error("Invalid address provided");
  }

  const contract = getErc20Contract(tokenAddress);
  const raw: bigint = await contract.balanceOf(walletAddress);
  const decimals: bigint = await contract.decimals();
  return ethers.formatUnits(raw, Number(decimals));
}
