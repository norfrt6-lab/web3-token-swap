import { describe, it, expect } from "vitest";
import { simulateSwap } from "@/services/swap";
import type { TokenMetadata } from "@/types";

const LINK: TokenMetadata = {
  address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  symbol: "LINK",
  name: "Chainlink Token",
  decimals: 18,
};

const WETH: TokenMetadata = {
  address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  symbol: "WETH",
  name: "Wrapped Ether",
  decimals: 18,
};

const USDC_6: TokenMetadata = {
  address: "0x0000000000000000000000000000000000000001",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
};

describe("simulateSwap", () => {
  it("returns positive output for a valid swap", () => {
    const result = simulateSwap("1", LINK, WETH);
    expect(Number(result.amountOut)).toBeGreaterThan(0);
    expect(Number(result.amountOut)).toBeLessThan(1);
  });

  it("preserves input amount in result", () => {
    const result = simulateSwap("42.5", LINK, WETH);
    expect(result.amountIn).toBe("42.5");
  });

  it("preserves token metadata in result", () => {
    const result = simulateSwap("1", LINK, WETH);
    expect(result.tokenIn.symbol).toBe("LINK");
    expect(result.tokenOut.symbol).toBe("WETH");
  });

  it("produces higher price impact for larger trades", () => {
    const small = simulateSwap("1", LINK, WETH);
    const large = simulateSwap("10000", LINK, WETH);
    expect(Number(large.priceImpact)).toBeGreaterThan(Number(small.priceImpact));
  });

  it("produces near-zero price impact for tiny trades", () => {
    const result = simulateSwap("0.001", LINK, WETH);
    expect(Math.abs(Number(result.priceImpact))).toBeLessThan(0.01);
  });

  it("output is always less than input for equal-reserve pool", () => {
    const result = simulateSwap("500", LINK, WETH);
    expect(Number(result.amountOut)).toBeLessThan(500);
  });

  it("calculates exchange rate close to 1:1 for equal-reserve pool", () => {
    const result = simulateSwap("1", LINK, WETH);
    expect(Number(result.exchangeRate)).toBeGreaterThan(0.99);
    expect(Number(result.exchangeRate)).toBeLessThan(1.0);
  });

  it("handles cross-decimal swaps", () => {
    const result = simulateSwap("1", LINK, USDC_6);
    expect(Number(result.amountOut)).toBeGreaterThan(0);
    expect(result.tokenOut.decimals).toBe(6);
  });

  it("handles very large amounts without throwing", () => {
    expect(() => simulateSwap("99999", LINK, WETH)).not.toThrow();
  });
});
