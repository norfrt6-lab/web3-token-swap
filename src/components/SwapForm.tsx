"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { TokenInput } from "./TokenInput";
import { SwapEstimateDisplay } from "./SwapEstimateDisplay";
import { useTokenMetadata, useSwapEstimate } from "@/hooks";
import { sanitizeAmount, isValidAmount } from "@/lib/validation";
import styles from "./SwapForm.module.css";

export function SwapForm() {
  const { isConnected } = useAccount();

  const [tokenInAddress, setTokenInAddress] = useState("");
  const [tokenOutAddress, setTokenOutAddress] = useState("");
  const [amountIn, setAmountIn] = useState("");

  const tokenInMeta = useTokenMetadata();
  const tokenOutMeta = useTokenMetadata();
  const swapEstimate = useSwapEstimate();

  const handleAmountChange = useCallback((value: string) => {
    setAmountIn(sanitizeAmount(value));
    swapEstimate.reset();
  }, [swapEstimate]);

  const canEstimate =
    tokenInMeta.state.status === "success" &&
    tokenOutMeta.state.status === "success" &&
    amountIn.length > 0 &&
    isValidAmount(amountIn, tokenInMeta.state.data.decimals);

  const handleEstimate = useCallback(() => {
    if (
      tokenInMeta.state.status !== "success" ||
      tokenOutMeta.state.status !== "success"
    )
      return;

    swapEstimate.estimate(amountIn, tokenInMeta.state.data, tokenOutMeta.state.data);
  }, [amountIn, tokenInMeta.state, tokenOutMeta.state, swapEstimate]);

  if (!isConnected) {
    return (
      <div className={styles.card} role="status">
        <p className={styles.placeholder}>Connect your wallet to start swapping.</p>
      </div>
    );
  }

  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        handleEstimate();
      }}
      aria-label="Token swap form"
    >
      <h2 className={styles.title}>Swap Tokens</h2>

      <TokenInput
        label="From (Token A)"
        address={tokenInAddress}
        onAddressChange={(v) => {
          setTokenInAddress(v);
          tokenInMeta.reset();
          swapEstimate.reset();
        }}
        tokenState={tokenInMeta.state}
        onResolve={tokenInMeta.fetch}
      />

      <div className={styles.arrowRow} aria-hidden="true">
        <span className={styles.arrow}>&#8595;</span>
      </div>

      <TokenInput
        label="To (Token B)"
        address={tokenOutAddress}
        onAddressChange={(v) => {
          setTokenOutAddress(v);
          tokenOutMeta.reset();
          swapEstimate.reset();
        }}
        tokenState={tokenOutMeta.state}
        onResolve={tokenOutMeta.fetch}
      />

      <div className={styles.amountSection}>
        <label className={styles.amountLabel} htmlFor="swap-amount">Amount</label>
        <input
          id="swap-amount"
          className={styles.amountInput}
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          autoComplete="off"
          value={amountIn}
          onChange={(e) => handleAmountChange(e.target.value)}
          aria-label="Amount of tokens to swap"
        />
      </div>

      <button
        type="submit"
        className={styles.swapBtn}
        disabled={!canEstimate}
        aria-busy={swapEstimate.state.status === "loading"}
      >
        Get Estimate
      </button>

      <SwapEstimateDisplay state={swapEstimate.state} />
    </form>
  );
}
