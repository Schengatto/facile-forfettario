import { createI18n } from 'vue-i18n'
import it from '../../locales/it'
import en from '../../locales/en'

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: "it",
    fallbackLocale: "it",
    messages: {
      it,
      en
    }
  })

  vueApp.use(i18n)
});