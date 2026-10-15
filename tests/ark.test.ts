import { describe, expect, it } from 'vitest'
import { addressMatchesNetwork, buildPaymentRequest, uniqueAmount, usdToSats, type ArkConfig } from '../app/utils/ark/payments'
import { getReceiverProvider, matchReceived, providerFromWallet, type HistoryTx } from '../server/utils/ark'

const cfg: ArkConfig = {
  provider: 'arkade-sdk',
  network: 'bitcoin',
  operatorUrl: 'https://arkade.computer',
  satsPerUsd: 1000,
}

describe('payments', () => {
  it('checks address prefix per network', () => {
    expect(addressMatchesNetwork('ark1x', 'bitcoin')).toBe(true)
    expect(addressMatchesNetwork('tark1x', 'bitcoin')).toBe(false)
    expect(addressMatchesNetwork('tark1x', 'signet')).toBe(true)
    expect(addressMatchesNetwork('ark1x', 'regtest')).toBe(false)
  })
  it('converts usd to sats, rounding up', () => {
    expect(usdToSats(1.0001, 1000)).toBe(1001)
    expect(() => usdToSats(0, 1000)).toThrow()
  })
  it('adds a 1..99 sat suffix', () => {
    for (let n = 0; n < 300; n++) {
      const d = uniqueAmount(5000, n) - 5000
      expect(d).toBeGreaterThanOrEqual(1)
      expect(d).toBeLessThanOrEqual(99)
    }
  })
  it('builds a request and rejects bad addresses', () => {
    const r = buildPaymentRequest(cfg, 'ark1abc', 10, 7)
    expect(r).toMatchObject({ address: 'ark1abc', amountSats: 10000 + 8, orderRef: 'ccf-7', createdAt: 7 })
    expect(() => buildPaymentRequest(cfg, '', 10, 1)).toThrow(/not available/)
    expect(() => buildPaymentRequest(cfg, 'tark1x', 10, 1)).toThrow(/bitcoin/)
  })
})

const tx = (over: Partial<HistoryTx>): HistoryTx => ({
  key: { arkTxid: 'ark-1' },
  type: 'RECEIVED',
  amount: 1050,
  settled: false,
  createdAt: 2000,
  ...over,
})

describe('server receiver', () => {
  it('matches only RECEIVED, exact amount, not older than since', () => {
    expect(matchReceived([tx({})], 1050, 1000)).toBe('ark-1')
    expect(matchReceived([tx({ type: 'SENT' })], 1050, 1000)).toBeUndefined()
    expect(matchReceived([tx({})], 1051, 1000)).toBeUndefined()
    expect(matchReceived([tx({ createdAt: 500 })], 1050, 1000)).toBeUndefined()
  })
  it('falls back through the txid keys', () => {
    expect(matchReceived([tx({ key: { commitmentTxid: 'c' } })], 1050, 0)).toBe('c')
    expect(matchReceived([tx({ key: { boardingTxid: 'b' } })], 1050, 0)).toBe('b')
  })
  it('wraps a wallet and creates it lazily, once', async () => {
    let created = 0
    const p = providerFromWallet('arkade-sdk', async () => {
      created++
      return { getAddress: async () => 'ark1abc', getTransactionHistory: async () => [tx({})] }
    })
    expect(created).toBe(0)
    expect(await p.getAddress()).toBe('ark1abc')
    expect(await p.findPayment(1050, 0)).toBe('ark-1')
  })
  it('rejects unknown providers and a missing mnemonic', () => {
    expect(() => getReceiverProvider({ ...cfg, provider: 'nope' }, 'x')).toThrow(/Unknown ARK provider/)
    expect(() => getReceiverProvider(cfg, '')).toThrow(/NUXT_ARK_MNEMONIC/)
  })
})
