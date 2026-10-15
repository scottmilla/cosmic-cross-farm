export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  modules: ['@tresjs/nuxt'],
  ssr: false,
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  vite: {
    // keep a single copy of three across TresJS and our own imports (avoids blank scenes after dep re-optimization)
    resolve: { dedupe: ['three', 'vue'] },
    optimizeDeps: { include: ['three', '@tresjs/core'] },
  },
  devtools: { enabled: false },
  // Override with NUXT_PUBLIC_ARK_* env vars (see ARK.md). Operator URLs are from the Arkade developer-resources docs.
  runtimeConfig: {
    arkMnemonic: '', // private; set NUXT_ARK_MNEMONIC on the server only
    public: {
      ark: {
        provider: 'arkade-sdk',
        network: 'bitcoin',
        operatorUrl: 'https://arkade.computer',
        satsPerUsd: 0, // 0 = unset; no price oracle is documented by Arkade, so set a rate yourself
      },
    },
  },
  app: {
    head: {
      title: 'Cosmic Cross Farm',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&family=Fondamento&display=swap' },
      ],
    },
  },
})
