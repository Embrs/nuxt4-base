<script setup lang="ts">
// OpenModalExampleInfoForm 範例彈層內容
// -- 引入 --------------------------------------------------------------------------------------------
const $mitt = UseMitt();

// -- 資料 --------------------------------------------------------------------------------------------
type Props = {
  id: number; // ID
}

const props = defineProps<Props>();

// 加載中
const isLoading = ref(true);

// 內容
const content = ref('');

// -- 流程 --------------------------------------------------------------------------------------------
/** 初始化 */
const InitFlow = (): boolean => {
  isLoading.value = true;
  try {
    // 範例：載入內容 if (!await ApiGetInfo(props.id)) return false;
    content.value = `這是 ID ${props.id} 的範例彈層內容，可放置任意自訂排版。`;
    return true;
  } catch (err) {
    return false;
  } finally {
    isLoading.value = false;
  }
};

// -- 生命週期 -----------------------------------------------------------------------------------------
onMounted(() => {
  if (!InitFlow()) EmitClose();
  $mitt.OnRefresh(InitFlow);
  $mitt.OnReload(InitFlow);
});

// -- 發送事件 -----------------------------------------------------------------------------------------
type Emit = { 'on-close': [] }
const emit = defineEmits<Emit>();

const EmitClose = () => {
  emit('on-close');
};
</script>

<template lang="pug">
.OpenModalExampleInfoForm(v-loading="isLoading")
  p.OpenModalExampleInfoForm__text {{ content }}
</template>

<style lang="scss" scoped>
// 佈局 ----
.OpenModalExampleInfoForm {
  min-height: 80px;
}

// 組件 ----
.OpenModalExampleInfoForm__text {
  margin: 0;
  line-height: 1.6;
}
</style>
