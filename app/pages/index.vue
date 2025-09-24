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
  
  .box-4 
    .box-item(v-for="item in 3" :key="item")
  .box-5 
    .box-item(v-for="item in 3" :key="item")
  .box-6 
    .box-item(v-for="item in 3" :key="item")
  ElButton(type="primary" @click="OpenDialogDemo") Open DialogDemo
  ElButton(type="success" @click="$open.DialogVideoRecording") Open DialogVideoRecording
  ElButton(type="warning" @click="$open.DialogImageEdit") Open DialogImageEdit
  ElButton(type="info" @click="$open.DrawerDemoInfo") Open DrawerDemoInfo
  ElButton(type="danger") Test
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

.box-4 {
  @include rwd-pc {
    @include grid-warp(200px, 20px);
  }
  @include rwd-mobile {
    @include grid-warp-fit(100px, 20px);
  }
  .box-item {
    width: 100%;
    padding-bottom: 100%;
    background-color: red;
  }
}

.box-5   {
  @include grid-warp-fit(100px, 20px);
  .box-item {
    width: 100%;
    padding-bottom: 100%;
    background-color: blue;
  }
}
.box-6 {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 20px;
  display: flex;
  .box-item {
    width: 100px;
    // max-width: 300px;
    padding-bottom: 10%;
    background-color: green;
  }
}
</style>
