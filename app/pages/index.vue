<script setup lang="ts">
// PageIndex 請填寫功能描述👈
</script>

<template lang="pug">
.PageIndex
  .g-row
    p PageIndex
    p 123
  DemoItem1
  NuxtLink(to="/demo/pinia") DemoPinia
  button 123
  .box
    .test1
      p 123
    .text2
      p 456
</template>

<style lang="scss" scoped>
// 佈局 ----
.PageIndex {
  // TODO

  .box {
    width: 200px;
    height: 200px;
     @include grid-place("center");
    .test1 {
      grid-area: center;
      z-index: 0;
      background-color: red;
    }
    .text2 {
      grid-area: center;
      z-index: 1;
      background-color:  green
    }
    
  }
}

// 組件 ----
</style>
