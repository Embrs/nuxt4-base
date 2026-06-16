<script setup lang="ts">
// LayoutBackDesk 後台佈局：側邊欄 + 頂部列 + 內容
</script>

<template lang="pug">
.LayoutBackDesk
  aside.LayoutBackDesk__sidebar
    slot(name="sidebar")
      span Sidebar
  .LayoutBackDesk__main
    header.LayoutBackDesk__header
      slot(name="header")
        span Header
    main.LayoutBackDesk__body
      slot
</template>

<style lang="scss" scoped>
// 佈局 ----
.LayoutBackDesk {
  @include wh(100%, 100vh);
  display: flex;
}

// 組件 ----
.LayoutBackDesk__sidebar {
  flex-shrink: 0;
  width: 220px;
  padding: 16px;
}
.LayoutBackDesk__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}
.LayoutBackDesk__header {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 24px;
}
.LayoutBackDesk__body {
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
}
</style>
