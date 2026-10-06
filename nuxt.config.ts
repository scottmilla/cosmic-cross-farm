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
