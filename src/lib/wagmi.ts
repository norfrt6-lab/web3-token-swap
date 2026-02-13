import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { CHAIN_CONFIG } from "@/constants";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(CHAIN_CONFIG.rpcUrl || undefined),
  },
  ssr: true,
});
