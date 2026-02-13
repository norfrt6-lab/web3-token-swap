"use client";

import type { AsyncState } from "@/types";
import type { SwapEstimate } from "@/types";
import styles from "./SwapEstimateDisplay.module.css";

interface Props {
  state: AsyncState<SwapEstimate>;
}

export function SwapEstimateDisplay({ state }: Props) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Loading swap estimate">
        <div className={styles.skeleton} />
        <div className={styles.skeleton} style={{ width: "60%" }} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={`${styles.card} ${styles.cardError}`} role="alert">
        <p className={styles.errorText}>{state.error}</p>
      </div>
    );
  }

  const { data } = state;
  return (
    <div className={styles.card} role="region" aria-label="Swap estimate result">
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.label}>You pay</dt>
          <dd className={styles.value}>
            {data.amountIn} {data.tokenIn.symbol}
          </dd>
        </div>
        <div className={styles.divider} />
        <div className={styles.row}>
          <dt className={styles.label}>You receive (est.)</dt>
          <dd className={`${styles.value} ${styles.highlight}`}>
            {Number(data.amountOut).toFixed(6)} {data.tokenOut.symbol}
          </dd>
        </div>
        <div className={styles.divider} />
        <div className={styles.row}>
          <dt className={styles.label}>Rate</dt>
          <dd className={styles.value}>
            1 {data.tokenIn.symbol} = {Number(data.exchangeRate).toFixed(6)} {data.tokenOut.symbol}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>Price impact</dt>
          <dd
            className={styles.value}
            style={{ color: Number(data.priceImpact) > 1 ? "var(--danger)" : "var(--text-secondary)" }}
          >
            {data.priceImpact}%
          </dd>
        </div>
      </dl>
    </div>
  );
}
