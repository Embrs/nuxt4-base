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
  NuxtLink(to="/sample/sign-in")
    ElButton Sign In
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
  
  ElButton(type="primary" @click="OpenDialogDemo") Open DialogDemo
  ElButton(type="success" @click="$open.DialogVideoRecording") Open DialogVideoRecording
  ElButton(type="warning" @click="$open.DialogImageEdit") Open DialogImageEdit
  ElButton(type="info" @click="$open.DrawerDemoInfo") Open DrawerDemoInfo
  ElButton(type="danger") Test
</template>

<style lang="scss" scoped>
// 佈局 ----
.PageIndex {
}
</style>
