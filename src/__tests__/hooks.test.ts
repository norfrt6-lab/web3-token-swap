import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSwapEstimate } from "@/hooks/useSwapEstimate";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import type { TokenMetadata } from "@/types";

// Mock the service layer
vi.mock("@/services", () => ({
  fetchTokenMetadata: vi.fn(),
  simulateSwap: vi.fn(),
}));

import { fetchTokenMetadata, simulateSwap } from "@/services";

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

describe("useTokenMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useTokenMetadata());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("returns error for invalid address", async () => {
    const { result } = renderHook(() => useTokenMetadata());

    await act(async () => {
      await result.current.fetch("0xBAD");
    });

    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.error).toMatch(/invalid/i);
    }
  });

  it("fetches metadata for a valid address", async () => {
    vi.mocked(fetchTokenMetadata).mockResolvedValueOnce(LINK);

    const { result } = renderHook(() => useTokenMetadata());

    await act(async () => {
      await result.current.fetch(LINK.address);
    });

    expect(result.current.state).toEqual({ status: "success", data: LINK });
    expect(fetchTokenMetadata).toHaveBeenCalledWith(LINK.address);
  });

  it("handles fetch failure", async () => {
    vi.mocked(fetchTokenMetadata).mockRejectedValueOnce(new Error("RPC down"));

    const { result } = renderHook(() => useTokenMetadata());

    await act(async () => {
      await result.current.fetch(LINK.address);
    });

    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.error).toMatch(/RPC down/);
    }
  });

  it("discards stale responses", async () => {
    // First call: slow response
    let resolveFirst!: (val: TokenMetadata) => void;
    const firstCall = new Promise<TokenMetadata>((r) => { resolveFirst = r; });
    vi.mocked(fetchTokenMetadata).mockReturnValueOnce(firstCall);

    // Second call: fast response
    vi.mocked(fetchTokenMetadata).mockResolvedValueOnce(WETH);

    const { result } = renderHook(() => useTokenMetadata());

    // Fire first request
    let firstPromise: Promise<void>;
    act(() => {
      firstPromise = result.current.fetch(LINK.address);
    });

    // Fire second request before first completes
    await act(async () => {
      await result.current.fetch(WETH.address);
    });

    // Now resolve the first (stale) request
    await act(async () => {
      resolveFirst(LINK);
      await firstPromise!;
    });

    // Should have WETH, not LINK
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.data.symbol).toBe("WETH");
    }
  });

  it("resets to idle and invalidates in-flight requests", async () => {
    let resolveCall!: (val: TokenMetadata) => void;
    const pending = new Promise<TokenMetadata>((r) => { resolveCall = r; });
    vi.mocked(fetchTokenMetadata).mockReturnValueOnce(pending);

    const { result } = renderHook(() => useTokenMetadata());

    let fetchPromise: Promise<void>;
    act(() => {
      fetchPromise = result.current.fetch(LINK.address);
    });

    // Reset while request is in flight
    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({ status: "idle" });

    // Resolve the stale request — state should stay idle
    await act(async () => {
      resolveCall(LINK);
      await fetchPromise!;
    });

    expect(result.current.state).toEqual({ status: "idle" });
  });
});

describe("useSwapEstimate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useSwapEstimate());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("returns error for invalid amount", () => {
    const { result } = renderHook(() => useSwapEstimate());

    act(() => {
      result.current.estimate("0", LINK, WETH);
    });

    expect(result.current.state.status).toBe("error");
  });

  it("returns success for valid estimate", () => {
    const mockEstimate = {
      amountIn: "1",
      amountOut: "0.99999",
      tokenIn: LINK,
      tokenOut: WETH,
      exchangeRate: "0.99999",
      priceImpact: "0.00",
    };
    vi.mocked(simulateSwap).mockReturnValueOnce(mockEstimate);

    const { result } = renderHook(() => useSwapEstimate());

    act(() => {
      result.current.estimate("1", LINK, WETH);
    });

    expect(result.current.state).toEqual({ status: "success", data: mockEstimate });
    expect(simulateSwap).toHaveBeenCalledWith("1", LINK, WETH);
  });

  it("handles simulateSwap throwing", () => {
    vi.mocked(simulateSwap).mockImplementationOnce(() => {
      throw new Error("overflow");
    });

    const { result } = renderHook(() => useSwapEstimate());

    act(() => {
      result.current.estimate("1", LINK, WETH);
    });

    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.error).toMatch(/overflow/);
    }
  });

  it("resets to idle", () => {
    const mockEstimate = {
      amountIn: "1", amountOut: "0.99", tokenIn: LINK, tokenOut: WETH,
      exchangeRate: "0.99", priceImpact: "0.00",
    };
    vi.mocked(simulateSwap).mockReturnValueOnce(mockEstimate);

    const { result } = renderHook(() => useSwapEstimate());

    act(() => result.current.estimate("1", LINK, WETH));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
