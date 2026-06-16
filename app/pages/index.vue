<script setup lang="ts">
// PageIndex
</script>

<template lang="pug">
.PageIndex
  p PageIndex
  ElButton(@click="$open.DialogDemo({demo: 'test'})") OpenDialogDemo
</template>

<style lang="scss" scoped>
// 佈局 ----
.PageIndex {
  padding: 16px;
}
</style>
