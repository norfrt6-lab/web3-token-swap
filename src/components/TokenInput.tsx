"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { AsyncState } from "@/types";
import type { TokenMetadata } from "@/types";
import { isValidAddress } from "@/lib/validation";
import styles from "./TokenInput.module.css";

interface TokenInputProps {
  label: string;
  address: string;
  onAddressChange: (address: string) => void;
  tokenState: AsyncState<TokenMetadata>;
  onResolve: (address: string) => void;
}

export function TokenInput({ label, address, onAddressChange, tokenState, onResolve }: TokenInputProps) {
  const [touched, setTouched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputId = useId();
  const feedbackId = useId();

  useEffect(() => {
    if (!touched) return;
    clearTimeout(debounceRef.current);

    if (isValidAddress(address)) {
      debounceRef.current = setTimeout(() => onResolve(address), 400);
    }

    return () => clearTimeout(debounceRef.current);
  }, [address, touched, onResolve]);

  const showError = touched && address.length > 0 && !isValidAddress(address);
  const hasAnyFeedback = showError || tokenState.status !== "idle";

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={`${styles.input} ${showError ? styles.inputError : ""}`}
        type="text"
        placeholder="0x..."
        spellCheck={false}
        autoComplete="off"
        value={address}
        onChange={(e) => {
          setTouched(true);
          onAddressChange(e.target.value.trim());
        }}
        aria-invalid={showError || tokenState.status === "error"}
        aria-describedby={hasAnyFeedback ? feedbackId : undefined}
      />

      <div id={feedbackId} aria-live="polite">
        {showError && <p className={styles.error} role="alert">Enter a valid Ethereum address</p>}

        {tokenState.status === "loading" && <p className={styles.meta}>Loading token info…</p>}

        {tokenState.status === "error" && <p className={styles.error} role="alert">{tokenState.error}</p>}

        {tokenState.status === "success" && (
          <div className={styles.badge}>
            <span className={styles.symbol}>{tokenState.data.symbol}</span>
            <span className={styles.name}>{tokenState.data.name}</span>
            <span className={styles.decimals}>{tokenState.data.decimals} decimals</span>
          </div>
        )}
      </div>
    </div>
  );
}
