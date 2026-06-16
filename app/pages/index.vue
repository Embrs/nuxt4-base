<script setup lang="ts">
// PageIndex 首頁：基底樣板入口與能力示意
const { t } = useI18n();

// -- 接收事件 -----------------------------------------------------------------------------------------
/** 開啟範例抽屜（示範 $open 用法，開新案後可移除） */
const ClickOpenExample = () => {
  $open.DrawerExampleInfo(1);
};
</script>

<template lang="pug">
.PageIndex
  h1.PageIndex__title {{ t('welcome') }}
  p.PageIndex__subtitle Nuxt 4 企業級前端基底樣板
  ul.PageIndex__features
    li 彈窗系統 $open：集中註冊於 components/open，支援 Drawer / Dialog
    li 三語系 i18n：zh / en / ja，預設繁中（prefix_except_default）
    li Element Plus 封裝：components/el 二次封裝，搭配 UseAsk 確認框
    li 主題色 color-mode：StoreTheme 管理，支援明暗切換
  ElButton.PageIndex__btn(type="primary" @click="ClickOpenExample") 開啟範例抽屜
</template>

<style lang="scss" scoped>
// 佈局 ----
.PageIndex {
  padding: 24px;
}

// 組件 ----
.PageIndex__title {
  font-weight: 700;
}
.PageIndex__subtitle {
  margin-bottom: 16px;
  color: #888;
}
.PageIndex__features {
  margin-bottom: 20px;
  padding-left: 20px;
  line-height: 1.9;
  list-style: disc;
}
.PageIndex__btn {
  margin-top: 4px;
}
</style>
