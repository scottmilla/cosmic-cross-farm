// Pure payment logic for the /ark checkout. No SDK imports so it stays unit-testable.
//
// Not from Arkade docs (our own design): the USD→sats rate, and the per-order amount
// suffix used to tell orders apart. The docs show no memo/reference field for Arkade
// receipts, so matching is by exact amount.

export interface ArkConfig {
  provider: string
  network: 'bitcoin' | 'mutinynet' | 'signet' | 'regtest'
  operatorUrl: string
  satsPerUsd: number
}

export interface PaymentRequest {
  provider: string
  address: string
  amountSats: number
  orderRef: string
  createdAt: number // ms epoch; payments older than this don't count
}

// Docs: Arkade addresses start with `ark1` on mainnet and `tark1` on testnet/regtest.
export function addressMatchesNetwork(address: string, network: ArkConfig['network']): boolean {
  return network === 'bitcoin' ? address.startsWith('ark1') : address.startsWith('tark1')
}

export function usdToSats(usd: number, satsPerUsd: number): number {
  if (!(usd > 0) || !(satsPerUsd > 0)) throw new Error('usd and satsPerUsd must be positive')
  return Math.ceil(usd * satsPerUsd)
}

/** Adds a 1..99 sat suffix derived from the nonce so concurrent orders have distinct amounts. */
export function uniqueAmount(baseSats: number, nonce: number): number {
  return baseSats + 1 + (Math.abs(Math.trunc(nonce)) % 99)
}

export function buildPaymentRequest(cfg: ArkConfig, address: string, totalUsd: number, nonce: number): PaymentRequest {
  if (!address) throw new Error('Store Arkade address is not available')
  if (!addressMatchesNetwork(address, cfg.network)) {
    throw new Error(`Merchant address does not look like a ${cfg.network} Arkade address`)
  }
  const amountSats = uniqueAmount(usdToSats(totalUsd, cfg.satsPerUsd), nonce)
  return { provider: cfg.provider, address, amountSats, orderRef: `ccf-${nonce}`, createdAt: nonce }
}
