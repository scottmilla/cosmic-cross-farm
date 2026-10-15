import type { ArkConfig } from '../../app/utils/ark/payments'

// Server-side store wallet. The recovery phrase lives only in the NUXT_ARK_MNEMONIC env var
// (private runtime config), never in the browser. Serverless-friendly: nothing long-running,
// each check reads the wallet's transaction history (docs: wallet.getTransactionHistory()).

export interface ArkReceiverProvider {
  id: string
  getAddress(): Promise<string>
  /** Txid of a RECEIVED payment of exactly `amountSats` created at/after `sinceMs`, if any. */
  findPayment(amountSats: number, sinceMs: number): Promise<string | undefined>
}

// Subset of the SDK's ArkTransaction we use (see node_modules/@arkade-os/sdk types).
export interface HistoryTx {
  key: { arkTxid?: string; commitmentTxid?: string; boardingTxid?: string }
  type: string
  amount: number
  settled: boolean
  createdAt: number // ms since epoch per SDK types
}

export function matchReceived(history: HistoryTx[], amountSats: number, sinceMs: number): string | undefined {
  const tx = history.find((t) => t.type === 'RECEIVED' && t.amount === amountSats && t.createdAt >= sinceMs)
  return tx && (tx.key.arkTxid ?? tx.key.commitmentTxid ?? tx.key.boardingTxid ?? 'unknown')
}

export interface WalletLike {
  getAddress(): Promise<string>
  getTransactionHistory(): Promise<HistoryTx[]>
}

export function providerFromWallet(id: string, getWallet: () => Promise<WalletLike>): ArkReceiverProvider {
  return {
    id,
    async getAddress() {
      return (await getWallet()).getAddress()
    },
    async findPayment(amountSats, sinceMs) {
      return matchReceived(await (await getWallet()).getTransactionHistory(), amountSats, sinceMs)
    },
  }
}

let cached: { key: string; provider: ArkReceiverProvider } | undefined

export function getReceiverProvider(cfg: ArkConfig, mnemonic: string): ArkReceiverProvider {
  if (cfg.provider !== 'arkade-sdk') throw new Error(`Unknown ARK provider "${cfg.provider}". Available: arkade-sdk`)
  if (!mnemonic) throw new Error('NUXT_ARK_MNEMONIC is not set')
  const key = [cfg.provider, cfg.network, cfg.operatorUrl, mnemonic].join('|')
  if (cached?.key === key) return cached.provider

  let wallet: Promise<WalletLike> | undefined
  const getWallet = () =>
    (wallet ??= (async () => {
      const { MnemonicIdentity, Wallet, InMemoryWalletRepository, InMemoryContractRepository } = await import('@arkade-os/sdk')
      const identity = MnemonicIdentity.fromMnemonic(mnemonic, { isMainnet: cfg.network === 'bitcoin' })
      // The SDK defaults to IndexedDB, which doesn't exist in Node (history call fails). In-memory
      // repositories are what the developer-preview docs use; state is rebuilt per cold start.
      return (await Wallet.create({
        identity,
        arkServerUrl: cfg.operatorUrl,
        storage: { walletRepository: new InMemoryWalletRepository(), contractRepository: new InMemoryContractRepository() },
      })) as unknown as WalletLike
    })().catch((e) => {
      wallet = undefined // allow retry after a failed start
      throw e
    }))
  cached = { key, provider: providerFromWallet(cfg.provider, getWallet) }
  return cached.provider
}
