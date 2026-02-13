import { WalletConnect, SwapForm } from "@/components";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.logo}>TokenSwap</h1>
        <WalletConnect />
      </header>
      <section className={styles.content}>
        <SwapForm />
      </section>
      <footer className={styles.footer}>
        <span>Sepolia Testnet</span>
        <span>&middot;</span>
        <span>Simulated Swap</span>
      </footer>
    </main>
  );
}
