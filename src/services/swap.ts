import { ethers } from "ethers";
import type { TokenMetadata, SwapEstimate } from "@/types";

/**
 * Simulates a swap estimate.
 *
 * In production this would query an AMM (Uniswap Router, 1inch, etc.).
 * For this screening project we use a deterministic mock that behaves
 * like a constant-product pool so the numbers stay realistic.
 */
const MOCK_POOL_RESERVE = ethers.parseUnits("100000", 18); // 100k tokens each side

export function simulateSwap(
  amountIn: string,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
): SwapEstimate {
  const parsedIn = ethers.parseUnits(amountIn, tokenIn.decimals);

  // Constant-product: amountOut = (reserveOut * amountIn) / (reserveIn + amountIn)
  const reserveIn = MOCK_POOL_RESERVE;
  const reserveOut = MOCK_POOL_RESERVE;

  const numerator = reserveOut * parsedIn;
  const denominator = reserveIn + parsedIn;
  const rawOut = numerator / denominator;

  const amountOut = ethers.formatUnits(rawOut, tokenOut.decimals);

  // Exchange rate: how many tokenOut per 1 tokenIn
  const oneTokenIn = ethers.parseUnits("1", tokenIn.decimals);
  const rateNumerator = reserveOut * oneTokenIn;
  const rateDenominator = reserveIn + oneTokenIn;
  const rateRaw = rateNumerator / rateDenominator;
  const exchangeRate = ethers.formatUnits(rateRaw, tokenOut.decimals);

  // Price impact = 1 - (effectivePrice / spotPrice)
  const effectivePrice = Number(amountOut) / Number(amountIn);
  const spotPrice = Number(exchangeRate);
  const priceImpact = spotPrice > 0 ? ((1 - effectivePrice / spotPrice) * 100).toFixed(2) : "0.00";

  return {
    amountIn,
    amountOut,
    tokenIn,
    tokenOut,
    exchangeRate,
    priceImpact,
  };
}
