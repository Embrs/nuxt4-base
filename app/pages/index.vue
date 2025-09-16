<script setup lang="ts">
// PageIndex 請填寫功能描述👈
</script>

<template lang="pug">
.PageIndex
  div(class="g-row")
    p PageIndex
    p 123
  DemoItem1
  //- NuxtLink(to="/demo/pinia") DemoPinia
  button 123
  .box
    .test1
      p 123456789
    .text2
      p abc
</template>

<style lang="scss" scoped>
// 佈局 ----
.PageIndex {
  // TODO

  .box {
    width: 200px;
    height: 200px;
     @include grid-place("test", center, center);
    .test1 {
      grid-area: test;
      z-index: 0;
 
        background-color: red;
    
    }
    .text2 {
      grid-area: test;
      z-index: 1;

        background-color:  green;

    }
    
  }
}

// 組件 ----
</style>
