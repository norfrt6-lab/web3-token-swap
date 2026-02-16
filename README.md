# Web3 Token Swap

A decentralized token swap interface built with **Next.js** and **wagmi** for the Ethereum Sepolia testnet. It uses a simulated constant-product AMM pool to calculate swap estimates in real time.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![wagmi](https://img.shields.io/badge/wagmi-2.13-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Wallet Connection** - Connect MetaMask or any injected wallet provider
- **On-chain Token Resolution** - Fetch ERC-20 token name, symbol, and decimals directly from the blockchain
- **Swap Estimation** - Constant-product AMM formula (`x * y = k`) with output amount, exchange rate, and price impact
- **Rate Limiting** - Sliding-window rate limiter on API routes (30 req / 60s)
- **Input Validation** - Ethereum address format and token amount validation with user feedback
- **Accessibility** - ARIA labels, roles, and live regions for screen readers
- **Dark Theme** - Responsive dark UI with CSS custom properties

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.6 |
| Web3 | wagmi 2, viem, ethers 6 |
| State | React Query (TanStack Query 5) |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- A Sepolia RPC endpoint ([Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/))

### Installation

```bash
git clone https://github.com/norfrt6-lab/web3-token-swap.git
cd web3-token-swap
npm install
```

### Environment Variables

Copy the example file and fill in your RPC URL:

```bash
cp .env.example .env.local
```

```env
# RPC endpoint for Sepolia testnet
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_CHAIN_ID=11155111

# Server-side RPC URL (never exposed to client)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

### Run

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm start          # Start production server
```

## Testing

```bash
npm test           # Run unit tests
npm run test:watch # Run unit tests in watch mode
npx playwright test # Run E2E tests (requires build first)
```

### Test Coverage

- **Swap simulation** - Various token decimals, zero amounts, edge cases
- **Custom hooks** - Async state management, race condition handling
- **Input validation** - Address format, amount bounds, sanitization
- **API routes** - Rate limiting, error responses
- **E2E** - Page load, wallet prompt, API endpoint validation

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   └── api/token-metadata/ # Token metadata endpoint with rate limiting
├── components/             # React components (SwapForm, TokenInput, etc.)
├── hooks/                  # Custom hooks (useSwapEstimate, useTokenMetadata)
├── services/               # Business logic (swap simulation, token fetching)
├── lib/                    # Utilities (validation, rate limiting, wagmi config)
├── constants/              # Chain config, ERC-20 ABI, known tokens
├── types/                  # TypeScript interfaces
└── __tests__/              # Unit tests
e2e/                        # Playwright E2E tests
```

## How the Swap Works

The app simulates a constant-product AMM pool:

```
amountOut = (reserveOut * amountIn) / (reserveIn + amountIn)
```

Each pool is initialized with **100,000** tokens per side. The price impact is calculated as the percentage difference between the effective rate and the initial pool rate.

> This is a **simulated** pool for demo/testing purposes - no real tokens are exchanged.

## Known Test Tokens (Sepolia)

| Token | Address |
|---|---|
| UNI | `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` |
| WETH | `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14` |
| LINK | `0x779877A7B0D9E8603169DdbD7836e478b4624789` |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

