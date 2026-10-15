<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { buildPaymentRequest, type ArkConfig, type PaymentRequest } from '~/utils/ark/payments'

useHead({ title: 'Pay with Arkade · Cosmic Cross Farm' })

const game = useGame()
const cfg = useRuntimeConfig().public.ark as ArkConfig

const request = ref<PaymentRequest | null>(null)
const storeAddress = ref('')
const error = ref('')
const copied = ref('')
const qr = ref('')
const paidTx = ref('')

// The store wallet lives on the server (NUXT_ARK_MNEMONIC); the page only learns its address.
onMounted(async () => {
  try {
    storeAddress.value = (await $fetch<{ address: string }>('/api/ark/address')).address
  } catch {
    error.value = 'Arkade checkout is unavailable right now (store wallet not configured).'
  }
})

let poll: ReturnType<typeof setInterval> | undefined
function stopPolling() {
  clearInterval(poll)
  poll = undefined
}
function startPolling(req: PaymentRequest) {
  stopPolling()
  const check = async () => {
    try {
      const r = await $fetch<{ paid: boolean; txid?: string }>('/api/ark/payment', { query: { amount: req.amountSats, since: req.createdAt } })
      if (r.paid) {
        paidTx.value = r.txid ?? ''
        stopPolling()
      }
    } catch {
      /* transient: keep polling */
    }
  }
  poll = setInterval(check, 5000)
}
onBeforeUnmount(stopPolling)

async function makeRequest() {
  error.value = ''
  paidTx.value = ''
  try {
    request.value = buildPaymentRequest(cfg, storeAddress.value, game.cartTotal.value, Date.now())
    // QR holds the bare address only: the docs define no payment-URI format with an amount.
    const { toDataURL } = await import('qrcode')
    qr.value = await toDataURL(request.value.address, { margin: 2, width: 336 })
    startPolling(request.value)
  } catch (e) {
    error.value = (e as Error).message
  }
}
async function copy(label: string, text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = label
  setTimeout(() => (copied.value = ''), 1500)
}

const configured = computed(() => !!storeAddress.value && cfg.satsPerUsd > 0)
</script>

<template>
  <main class="ark">
    <div class="head">
      <h1>Pay with Arkade</h1>
      <NuxtLink to="/" class="back">← Orchard</NuxtLink>
    </div>
    <p class="muted small">{{ cfg.network }} · {{ cfg.provider }}</p>

    <p v-if="error" class="err">{{ error }}</p>

    <section class="card">
      <p v-if="!game.cart.value.length" class="muted">Your basket is empty. <NuxtLink to="/">Go find a tree!</NuxtLink></p>
      <template v-else>
        <template v-if="!request">
          <ul>
            <li v-for="l in game.cart.value" :key="l.tree.id"><span>{{ l.tree.variety }} {{ l.tree.type }} × {{ l.qty }}</span><b>{{ formatUsd(l.tree.price * l.qty) }}</b></li>
          </ul>
          <div class="total"><span>Total</span><b>{{ formatUsd(game.cartTotal.value) }}</b></div>
          <p v-if="!configured && !error" class="muted small">Loading store wallet…</p>
          <p v-if="cfg.satsPerUsd <= 0" class="err">Set NUXT_PUBLIC_ARK_SATS_PER_USD (see ARK.md).</p>
          <button class="btn btn-primary" :disabled="!configured" @click="makeRequest">Create payment request</button>
        </template>

        <div v-else class="req">
          <p class="send">Send <b>{{ request.amountSats.toLocaleString() }} sats</b> <span class="muted">({{ formatUsd(game.cartTotal.value) }})</span></p>
          <img v-if="qr" :src="qr" alt="QR code of the store's Arkade address" class="qr" width="168" height="168">
          <code>{{ request.address }}</code>
          <div class="row">
            <button class="btn" @click="copy('addr', request.address)">{{ copied === 'addr' ? 'Copied' : 'Copy address' }}</button>
            <button class="btn" @click="copy('amt', String(request.amountSats))">{{ copied === 'amt' ? 'Copied' : 'Copy amount' }}</button>
          </div>
          <p v-if="paidTx" class="ok">Payment received ✓ ({{ paidTx.slice(0, 12) }}…)</p>
          <p v-else class="muted small">Waiting for your payment… Send the exact amount: its last digits identify your order ({{ request.orderRef }}).</p>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
/* own scroll container: the global stylesheet locks html/body for the 3D game */
.ark { position: fixed; inset: 0; overflow-y: auto; max-width: 640px; margin: 0 auto; padding: .75rem .75rem 2rem; font-size: 16px; -webkit-overflow-scrolling: touch; touch-action: pan-y; }
.head { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; }
h1 { font-family: var(--font-display); margin: .1em 0; font-size: 1.5rem; }
.back { color: var(--ink); font-size: .85rem; white-space: nowrap; }
.muted { opacity: .7; margin: .2em 0; }
.small { font-size: .78rem; line-height: 1.25; }
.tabs, .row { display: flex; gap: .5rem; margin: .5rem 0; }
.tabs .btn, .row .btn { padding: .3em .8em; font-size: .9rem; border-width: 2px; border-bottom-width: 4px; border-radius: 10px; }
.row .btn { flex: 1; }
.card { background: var(--cream); border: 3px solid var(--ink); border-radius: 14px; padding: .7rem; }
.card p { margin: .3em 0; }
.send { font-size: 1.05rem; text-align: center; }
ul { list-style: none; margin: 0 0 .4rem; padding: 0; }
li, .total { display: flex; justify-content: space-between; padding: .2em 0; gap: 1rem; }
code { display: block; word-break: break-all; background: #fff; border: 2px solid var(--ink); border-radius: 8px; padding: .3em .5em; margin: .4em 0; font-size: .72rem; line-height: 1.25; }
textarea { width: 100%; font: inherit; padding: .5em; border: 2px solid var(--ink); border-radius: 8px; margin-bottom: .6rem; }
.qr { display: block; margin: .3rem auto; border: 3px solid var(--ink); border-radius: 8px; background: #fff; }
.err { color: #b3261e; font-weight: 600; }
.ok { color: #1f7a24; font-weight: 700; }
</style>
