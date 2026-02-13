"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/validation";
import styles from "./WalletConnect.module.css";

function useHasInjectedProvider(): boolean | null {
  // null = not yet determined (SSR), true/false = client result
  if (typeof window === "undefined") return null;
  return !!(window as unknown as { ethereum?: unknown }).ethereum;
}

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const hasProvider = useHasInjectedProvider();

  const injected = connectors.find((c) => c.id === "injected");

  if (isConnected && address) {
    return (
      <div className={styles.connected} role="status" aria-label="Wallet connected">
        <span className={styles.indicator} aria-hidden="true" />
        <span className={styles.address}>{truncateAddress(address)}</span>
        <button
          className={styles.disconnectBtn}
          onClick={() => disconnect()}
          aria-label="Disconnect wallet"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (hasProvider === false) {
    return (
      <a
        className={styles.connectBtn}
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        role="button"
      >
        Install MetaMask
      </a>
    );
  }

  return (
    <div className={styles.connectWrapper}>
      <button
        className={styles.connectBtn}
        disabled={isConnecting}
        onClick={() => injected && connect({ connector: injected })}
        aria-label="Connect MetaMask wallet"
      >
        {isConnecting ? "Connecting\u2026" : "Connect MetaMask"}
      </button>
      {connectError && (
        <p className={styles.connectError} role="alert">
          {connectError.message.includes("User rejected")
            ? "Connection rejected"
            : "Connection failed"}
        </p>
      )}
    </div>
  );
}
