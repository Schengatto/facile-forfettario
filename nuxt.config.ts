
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/icon',
  ],
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/logo.svg' }],
      htmlAttrs: {
        lang: "it",
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=0.8, maximum-scale=1.0, user-scalable=no',
    }
  },
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    }
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true }
})
