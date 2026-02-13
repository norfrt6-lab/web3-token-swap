export interface TokenMetadata {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface SwapEstimate {
  amountIn: string;
  amountOut: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  exchangeRate: string;
  priceImpact: string;
}

export interface SwapFormState {
  tokenInAddress: string;
  tokenOutAddress: string;
  amountIn: string;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
