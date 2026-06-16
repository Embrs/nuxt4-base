<script setup lang="ts">
// LayoutDefault 預設佈局：無頁首頁尾，直接渲染頁面內容
</script>

<template lang="pug">
.LayoutDefault
  slot
</template>

<style lang="scss" scoped>
// 佈局 ----
.LayoutDefault {
  min-height: 100vh;
}
</style>
