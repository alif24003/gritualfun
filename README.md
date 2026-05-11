# GRITUAL.FUN

> **The Premier Meme Token Launchpad on Ritual Network Testnet.**

**Live Demo:** [gritual.app](https://gritual.app)

Gritual.fun is a decentralized application (dApp) built on the Ritual Network Testnet. It's allows any user to deploy, buy, and sell meme tokens instantly without needing to provide initial seed liquidity.

Price discovery is driven by an automated **Bonding Curve AMM**, ensuring fair launches and instant liquidity.

---

## Key Features

* **Instant Token Creation:** Deploy a standard ERC-20 meme token in seconds with just a name, ticker, and image.
* **Bonding Curve AMM:** Predictable price discovery. Once the token hits a market cap of **50 RITUAL**, the bonding curve is completed.
* **Auto-Payout Creator Royalties:** Creators earn a **0.5% fee** on every single trade (Buy/Sell). Payouts are transferred instantly and automatically to the creator's wallet—no manual claiming required.
* **Live On-Chain Multiplayer:** Real-time transaction history and holder distribution powered by live blockchain event listeners (Zero-refresh UX).
* **Advanced Filtering:** Sort and search tokens by Newest, Market Cap, 24H Volume, and Movers.
* **Degen-Ready Mobile UI:** Fully responsive design, allowing users to trade seamlessly on desktop or mobile.

---

## Tech Stack

**Frontend:**

* [Next.js](https://nextjs.org/) (App Router) - React Framework
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling for that sleek, dark terminal vibe
* [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/) - Type-safe Web3 hooks and Ethereum interactions
* [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) - High-performance financial charts by TradingView

**Smart Contracts:**

* [Solidity](https://soliditylang.org/) `^0.8.20`
* [OpenZeppelin](https://openzeppelin.com/) (ERC20 & ReentrancyGuard)
* Deployed on **Ritual Network Testnet (CratD2C)**

---

## Local Development

Want to run Gritual.fun locally? Follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/gritual-fun.git
cd gritual-fun

```

### 2. Install dependencies

```bash
npm install
# or
yarn install

```

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory and add your deployed Factory Contract address:

```env
NEXT_PUBLIC_FACTORY_ADDRESS=0xYourDeployedFactoryContractAddressHere
NEXT_PUBLIC_PINATA_JWT=YourPinataJWTAPI

```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

---

## Smart Contract Architecture

The protocol consists of two main components:

1. **`MemeToken.sol`**: A standard ERC-20 contract that mints the total supply (1 Trillion) to the Factory upon creation.
2. **`GritualFactory.sol`**: The core engine. It acts as the deployer, the automated market maker (via bonding curve math `x * y = k` approximation), and the automated fee distributor.

---

## Disclaimer

This project is built for educational purposes and operates on the Ritual Testnet. It involves experimental smart contracts. Do not use real funds.