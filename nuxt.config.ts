// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // 使用開發工具
  devtools: { enabled: false },

  // == Setting ===============================================================================================
  devServer: {
    port: Number(process.env.NUXT_PORT || 3001),
    host: process.env.NUXT_HOST || '0.0.0.0'
    // https: { // Nuxt3Https 模式
    //   key: 'app/https/localhost.key',
    //   cert: 'app/https/localhost.crt'
    // }
  },
  
  // env 環境變數 -------------------------------
  runtimeConfig: {
    apiBase: '',
    public: {}
  },

  // 全局範圍設定 composables utils 為預設 --------
  imports: {
    dirs: [
      'stores', // pinia
    ]
  },

  // Css class 樣式 -----------------------------
  css: [
    // '@/assets/styles/css/index.css'
  ],

  // == Modules ===============================================================================================
  modules: [
    '@pinia/nuxt', // Pinia
    '@nuxt/eslint', 
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
  ],

  // nuxt font ----------------------------------
  // https://nuxt.dev.org.tw/modules/fonts
  fonts: { // 自動會抓不用設定
    families: [
      // { name: 'Noto Sans TC', provider: 'google' }
    ]
  },

  // nuxt icon ----------------------------------
  icon: {
    componentName: 'NuxtIcon',
    customCollections: [
      {
        prefix: 'my-icon',
        dir: 'app/assets/icons'
      }
    ],
    // https://github.com/nuxt/icon?tab=readme-ov-file#client-bundle
    clientBundle: {
      // 要包含在客戶端包中的圖示列表
      icons: [
        // 'material-symbols'
      ],
      scan: true, // 掃描項目中的所有組件並包括圖標
      includeCustomCollections: true, // 將所有自訂集合包含在客戶端捆綁包中
      sizeLimitKb: 256 // 保護未壓縮的套件大小，如果超過則建置失敗
    }
  },

  // element plus setting ----------------------------------------------
  // elementPlus: {
  //   icon: 'ElIcon',
  //   importStyle: 'scss'
  //   // themes: ['dark'] //暗黑模式
  // },

  // 組件配置 -----------------------------------------------------------
  components: {
    dirs: [
      {
        path: '~/components',
        global: true,
        ignore: ['**/*.{md,ts,js,mjs,mts}']
      }
    ]
  },

  // == html params =======================================================================================
  app: {
    // baseURL: '/',
    buildAssetsDir: '/static/',
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    // meta
    head: {
      bodyAttrs: {
        // id: 'Body'
      },
      htmlAttrs: {
        lang: 'zh-Hant-TW',
        // @ts-ignore
        version: process.env.npm_package_version as string // 版本號
      },
      meta: [
        /** 去除擾人自動偵測 */
        { name: 'format-detection', content: 'telephone=no,email=no,adress=no' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' } // 禁止縮放
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' }

      ]
    }
  },

  // == Nitro server =======================================================================================
  nitro: {
    compressPublicAssets: {
      gzip: true
      // brotli: true
    },

    // 開發模式戶端代理
    // devProxy: {
    //   '/api': {
    //     target: `${process.env.NUXT_API_BASE as string}/api`, // 這裡是接口地址
    //     changeOrigin: true,
    //     prependPath: true
    //   }
    // },

    // Nuxt route 路由設定 ------------
    // https://nuxt.com/docs/guide/concepts/rendering#route-rules
    routeRules: {
      // '/api/**': { // 自訂反向代理
      //   proxy: `${process.env.NUXT_API_BASE as string}/api/**`
      // }
      // '/': { ssr: true },  
    }
  },

  // == Vite ===============================================================================================
  vite: {
    css: {
      preprocessorMaxWorkers: true, // CPU 核心数减 1
      preprocessorOptions: {
        scss: { // scss 配置
          silenceDeprecations: ['legacy-js-api'],
          additionalData: `
          `,
          quietDeps: true // 關閉警告
        }
      }
    }
  }

});
