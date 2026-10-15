import { getReceiverProvider } from '../../utils/ark'
import type { ArkConfig } from '../../../app/utils/ark/payments'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  try {
    const address = await getReceiverProvider(config.public.ark as ArkConfig, config.arkMnemonic as string).getAddress()
    return { address }
  } catch (e) {
    console.error('[ark] address failed:', (e as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Arkade receiver unavailable' })
  }
})
