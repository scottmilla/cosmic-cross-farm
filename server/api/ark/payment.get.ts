import { getReceiverProvider } from '../../utils/ark'
import type { ArkConfig } from '../../../app/utils/ark/payments'

// GET /api/ark/payment?amount=<sats>&since=<ms epoch>  →  { paid: boolean, txid?: string }
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const amount = Number(q.amount)
  const since = Number(q.since)
  if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isFinite(since)) {
    throw createError({ statusCode: 400, statusMessage: 'amount and since are required numbers' })
  }
  const config = useRuntimeConfig()
  try {
    const provider = getReceiverProvider(config.public.ark as ArkConfig, config.arkMnemonic as string)
    // small slack for clock skew between this server and the browser that created the request
    const txid = await provider.findPayment(amount, since - 60_000)
    return txid ? { paid: true, txid } : { paid: false }
  } catch (e) {
    console.error('[ark] payment check failed:', (e as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Arkade receiver unavailable' })
  }
})
