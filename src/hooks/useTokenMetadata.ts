"use client";

import { useCallback, useRef, useState } from "react";
import type { TokenMetadata, AsyncState } from "@/types";
import { isValidAddress } from "@/lib/validation";
import { fetchTokenMetadata } from "@/services";

export function useTokenMetadata() {
  const [state, setState] = useState<AsyncState<TokenMetadata>>({ status: "idle" });
  const requestIdRef = useRef(0);

  const fetch = useCallback(async (address: string) => {
    if (!isValidAddress(address)) {
      setState({ status: "error", error: "Invalid ERC-20 address format" });
      return;
    }

    // Increment request ID so stale responses are discarded
    const id = ++requestIdRef.current;
    setState({ status: "loading" });

    try {
      const metadata = await fetchTokenMetadata(address);

      // Only apply if this is still the most recent request
      if (id !== requestIdRef.current) return;

      setState({ status: "success", data: metadata });
    } catch (err) {
      if (id !== requestIdRef.current) return;

      const message = err instanceof Error ? err.message : "Failed to fetch token metadata";
      setState({ status: "error", error: message });
    }
  }, []);

  const reset = useCallback(() => {
    requestIdRef.current++;
    setState({ status: "idle" });
  }, []);

  return { state, fetch, reset };
}
