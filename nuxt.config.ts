// https://nuxt.com/docs/api/configuration/nuxt-config
import { visualizer } from 'rollup-plugin-visualizer'; // 打包分析
import version from './version'; // 版本號
import dayjs from 'dayjs'; // 日期處理

// ------------------------
const useVisualizer = false; // 使用打包分析
// ------------------------
// vite plugin 建置
const VitePlugins = () => {
  const arr = [];
  if (useVisualizer) {
    arr.push(
      visualizer({ // 打包分析 https://juejin.cn/post/7159410085460983839
        gzipSize: true,
        brotliSize: true,
        emitFile: false,
        filename: 'test.html', // 析圖產生的檔案名
        open: true // 如果存在本地服務端口，將在打包後自動展示
      })
    );
  }
  return arr;
};
// ===============================================================================
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
    public: {
      testMode: ''
    }
  },

  // 組件配置 -----------------------------------
  components: {
    dirs: [
      {
        path: '~/components',
        global: true,
        ignore: ['**/*.{md,ts,js,mjs,mts}']
      }
    ]
  },

  // 全局範圍設定 composables utils 為預設 --------
  imports: {
    dirs: [
      'stores', // pinia
      'composables/**', // composables
    ]
  },

  // Css class 樣式 -----------------------------
  css: [
    '@/assets/styles/css-class/index.css',
    '@/assets/styles/css-class/g-style.scss' // 全局通用
  ],

  // == Modules ===============================================================================================
  modules: [// Pinia
  '@pinia/nuxt', '@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon', '@nuxtjs/color-mode', // 入場動畫 https://motion.vueuse.org/features/presets
  '@vueuse/motion/nuxt', '@element-plus/nuxt', '@nuxtjs/i18n'],

  // nuxt font ----------------------------------
  // https://nuxt.dev.org.tw/modules/fonts
  fonts: { // 自動會抓不用設定
    families: [
      // { name: 'Noto Sans TC', provider: 'google' }
    ]
  },

  // colorMode 主題色 ----------------------------
  colorMode: {
    classSuffix: ''
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
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss'
    // themes: ['dark'] //暗黑模式
  },

  // 多語系 -------------------------------------------------------------
  i18n: {
    // 語系列表
    locales:[
      {
        code: 'zh',
        iso: 'zh-Hant-TW',
        file: 'zh.js',
        name: '繁體中文'
      },
      {
        code: 'en',
        iso: 'en',
        file: 'en.js',
        name: 'English'
      },
      {
        code: 'ja',
        iso: 'ja',
        file: 'ja.js',
        name: '日本語'
      }
    ],

    // 預設語系
    defaultLocale: 'zh',

    // 語系檔案所在資料夾（相對於專案根目錄）
    langDir: 'locales',


    // 路由前綴策略。如果預設語系也加前綴或不加前綴
    // 可選策略像是 'prefix'、'prefix_except_default'、'no_prefix' 等
    strategy: 'prefix_except_default',

    // 瀏覽器語言偵測
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      // redirectOn 可設 'root', 'all', etc. v10 行為有所改變，要注意 :contentReference[oaicite:2]{index=2}
      redirectOn: 'root'
    },
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
        version, // 版本號
        'created-at': dayjs().format('YYYY-MM-DD HH:mm:ss'), // 建立時間
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
            @use '@/assets/styles/scss-tool/config.scss' as *;
            @use '@/assets/styles/scss-tool/colors.scss' as *;
            @use '@/assets/styles/scss-tool/fn.scss' as *;
            @use '@/assets/styles/scss-tool/mixin.scss' as *;
            @use '@/assets/styles/scss-tool/font-size.scss' as *;
            @use '@/assets/styles/scss-tool/rwd.scss' as *;
          `,
          quietDeps: true // 關閉警告
        }
      }
    },
    plugins: VitePlugins()
  }

});