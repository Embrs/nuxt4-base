// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // 使用開發工具
  devtools: { enabled: false },
  // == Setting ===============================================================================================

  // == Modules ===============================================================================================
  modules: [
    '@nuxt/eslint', 
    '@nuxt/fonts',
    '@nuxt/icon'
  ]
});
