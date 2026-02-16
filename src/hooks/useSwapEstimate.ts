"use client";

import { useCallback, useState } from "react";
import type { TokenMetadata, SwapEstimate, AsyncState } from "@/types";
import { simulateSwap } from "@/services";
import { isValidAmount } from "@/lib/validation";

export function useSwapEstimate() {
  const [state, setState] = useState<AsyncState<SwapEstimate>>({
    status: "idle",
  });

  const estimate = useCallback(
    (amountIn: string, tokenIn: TokenMetadata, tokenOut: TokenMetadata) => {
      if (!isValidAmount(amountIn, tokenIn.decimals)) {
        setState({ status: "error", error: "Invalid amount" });
        return;
      }

      try {
        const result = simulateSwap(amountIn, tokenIn, tokenOut);
        setState({ status: "success", data: result });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Swap simulation failed";
        setState({ status: "error", error: message });
      }
    },
    [],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, estimate, reset };
}
