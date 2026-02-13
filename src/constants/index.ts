export const CHAIN_CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111,
  name: "Sepolia",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "",
} as const;

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
] as const;

// Well-known Sepolia testnet tokens for convenience
export const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": { symbol: "UNI", name: "Uniswap", decimals: 18 },
  "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14": { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  "0x779877A7B0D9E8603169DdbD7836e478b4624789": { symbol: "LINK", name: "Chainlink Token", decimals: 18 },
};

export const VALIDATION = {
  ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  MIN_AMOUNT: "0",
  MAX_DECIMALS: 18,
} as const;
