<script setup lang="ts">
// PageIndex 請填寫功能描述👈
const storeTheme = StoreTheme();
const $mitt = UseMitt();
const { locales } = useI18n();

const OpenDialogDemo = async() => {
  const res = await $open.DialogDemo({ demo: 'test123' });
  console.log(res);
};

const ApiDemo = async() => {
  const res = await $api.SignIn({ account: 'test', password: 'test' });
  console.log(res);
};

</script>

<template lang="pug">
.PageIndex
  div(class="g-row")
    p PageIndex
    p 123
  ElButton(@click="() => storeTheme.ChangeTheme('dark')") dark;
  ElButton(@click="() => storeTheme.ChangeTheme('light')") light;
  ElButton(@click="() => $mitt.EmitRefresh()") EmitRefresh;
  ElButton(@click="ApiDemo") ApiDemo;
  .row-item
    SwitchLocalePathLink(
      v-for="localeItem in locales" :key="localeItem.code" :locale="localeItem.code"
    )
      ElButton {{ localeItem.name }}
  .row-item
    p {{ $t('about.title') }}
  
  DemoItem1
  //- NuxtLink(to="/demo/pinia") DemoPinia
  ElButton 123
  .box
    .test1
      p 123456789
    .text2
      p abc
  p {{ $colorMode.preference }}
  .box2
    img.g-img-lock(:src="$tool.CreateDemoImg()")
  .box3
    p(v-for="item in 100" :key="item" v-motion-slide-visible-bottom ) {{ item }}

  ElButton(@click="OpenDialogDemo") Open DialogDemo
  ElButton(@click="$open.DialogVideoRecording") Open DialogVideoRecording
  ElButton(@click="$open.DialogImageEdit") Open DialogImageEdit
  ElButton Test
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
    overflow: hidden;
  }
}


// 組件 ----
.box3 {
  @include wh(400px, 400px);
  background-color: blue;
  overflow: auto;
}
</style>
