<script setup lang="ts">
// PageIndex 請填寫功能描述👈
const storeTheme = StoreTheme();
const $mitt = UseMitt();
</script>

<template lang="pug">
.PageIndex
  div(class="g-row")
    p PageIndex
    p 123
  button(@click="() => storeTheme.ChangeTheme('dark')") dark;
  button(@click="() => storeTheme.ChangeTheme('light')") light;
  button(@click="() => $mitt.EmitRefresh()") EmitRefresh;
  
  DemoItem1
  //- NuxtLink(to="/demo/pinia") DemoPinia
  button 123
  .box
    .test1
      p 123456789
    .text2
      p abc
  p {{ $colorMode.preference }}
  .box2

  .box3
    p(v-for="item in 100" :key="item" v-motion-slide-visible-bottom ) {{ item }}
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
  .box2 {
    @include wh(300px, 300px);
    background-color: $demo;
  }
}


// 組件 ----
.box3 {
  @include wh(400px, 400px);
  background-color: blue;
  overflow: auto;
}
</style>
