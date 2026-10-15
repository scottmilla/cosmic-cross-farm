# Arkade checkout (`/ark`)

Checkout in the basket links to `/ark`. The customer gets a payment request (store Arkade address, QR, exact sats). The page then polls the server, which checks the store wallet's history and shows "Payment received ✓".

The store wallet lives **on the server**: you set its recovery phrase once as a secret env var. The browser never sees it.

## Deploy (Vercel / Netlify)

Set these in the host's environment settings (Nuxt picks the Node preset automatically on both; do **not** use `nuxt generate`, which has no server routes):

| Variable | Secret? | Meaning |
|---|---|---|
| `NUXT_ARK_MNEMONIC` | **Yes** | Recovery phrase of a **dedicated** Arkade store wallet. Server only; never prefix with `PUBLIC`. |
| `NUXT_PUBLIC_ARK_SATS_PER_USD` | no | Fixed USD→sats rate. Required; the Arkade docs have no price oracle. |
| `NUXT_PUBLIC_ARK_NETWORK` | no | `bitcoin` (default), `mutinynet`, `signet`, `regtest`. |
| `NUXT_PUBLIC_ARK_OPERATOR_URL` | no | Docs list `https://arkade.computer` (mainnet, default), `https://mutinynet.arkade.sh`, `https://signet.arkade.sh`, `http://localhost:7070` (self-run regtest). |
| `NUXT_PUBLIC_ARK_PROVIDER` | no | Receiver implementation. Only `arkade-sdk` exists; add more in `server/utils/ark.ts`. |

Locally: copy `.env.example` to `.env` (gitignored), `npm run dev`. `npm test` runs the tests.

The store address is derived from the phrase, so there's nothing else to configure. `GET /api/ark/address` returns it; `GET /api/ark/payment?amount=<sats>&since=<ms>` returns `{paid, txid?}`.

## How it maps to the Arkade docs

From receiving-payments / create-your-wallet / payment-history: `MnemonicIdentity.fromMnemonic`, `Wallet.create`, `getAddress()`, `getTransactionHistory()` (a payment = `type: 'RECEIVED'`, matching `amount`, `createdAt` ≥ the request time). `createdAt` is milliseconds per the SDK's type definitions (the docs page is ambiguous).

The wallet uses the SDK's `InMemoryWalletRepository` / `InMemoryContractRepository` (as in the developer-preview docs) because the SDK's default, IndexedDB, doesn't exist in Node. State is rebuilt on every cold start; the docs don't say whether history is restored from the operator or from the repository. **Verified:** address and an empty-history check against the mainnet operator with a throwaway wallet. **Not verified:** that a real incoming payment shows up in history on a fresh serverless instance. Test this with a $1 order before sharing the link.

## Wallet compatibility

Both the customer's and the store's wallet must speak the **Arkade** protocol. Observed: paying our Arkade address from Noah failed with "address is an Arkade address and cannot be used here", so Noah can't be used as sender or receiver. Create the store wallet from a fresh phrase (any BIP-39 phrase works; the SDK derives the Arkade address from it) or from an Arkade wallet app.

## Not Arkade Intents

This uses plain Arkade payments, not Intents routes.
- **Lightning receive** (`lightning:BTC → arkade:BTC`): the developer-preview page says no solver serves it.
- **Lightning send** (`requestLightningSend`): documented, beta (500–50,000 sats, 0.30% fee, one pinned solver), but it's a payer-side flow and has no use for a store that only receives.
- **Asset exchange / on-chain routes:** out of scope.

## Limitations (our design, not Arkade's)

- **Order matching is by exact amount.** The docs show no memo field for Arkade receipts, so each order gets a 1–99 sat suffix; two orders with the same total and suffix in the same window can't be told apart. A payment counts if it arrived in the last minute before the request was made or later.
- **Polling, not a live subscription.** The page asks every 5 s while open. If the customer closes the tab, nothing records the payment; you'd see it in the store wallet's history. There is no order database.
- **Open endpoints.** `/api/ark/*` has no rate limiting or auth; each call reaches the operator. Add platform rate limiting before promoting it widely. They reveal only whether an amount was received, never the phrase.
- **Key custody.** The phrase sits in your host's env settings. Use a dedicated wallet, keep balances small and sweep to cold storage; the SDK's wallet-level fund handling is otherwise your responsibility.
- Mainnet moves real bitcoin. The USD→sats rate is static and can drift from the market.
