<script setup lang="ts">
// LayoutFrontDesk 前台佈局：頂部導覽列 + 內容 + 頁尾
</script>

<template lang="pug">
.LayoutFrontDesk
  header.LayoutFrontDesk__header
    slot(name="header")
      span Header
  main.LayoutFrontDesk__body
    slot
  footer.LayoutFrontDesk__footer
    slot(name="footer")
      span Footer
</template>

<style lang="scss" scoped>
// 佈局 ----
.LayoutFrontDesk {
  @include wh(100%, 100vh);
  display: flex;
  flex-direction: column;
}

// 組件 ----
.LayoutFrontDesk__header {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 24px;
}
.LayoutFrontDesk__body {
  flex: 1;
  overflow: auto;
}
.LayoutFrontDesk__footer {
  @include center;
  height: 48px;
}
</style>
