<script setup lang="ts">
// DemoPinia 請填寫功能描述👈
const storeDemo = StoreDemo();
const  bb = ref(111);
const Click = () => {
  bb.value++;
  storeDemo.Set(bb.value);
};

</script>

<template lang="pug">
.DemoPinia
  p DemoPinia
  button(@click="Click") Set
  p {{ storeDemo.aa }}

  DemoItem1
</template>

<style lang="scss" scoped>
// 佈局 ----
.DemoPinia {
  // TODO
}

// 組件 ----
</style>
