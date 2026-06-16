<script setup lang="ts">
// OpenModalExampleInfo 範例彈層（$open 用法範本：自訂遮罩 Modal，與 drawer/dialog 共用同一個 StoreOpen）
// -- 引入 --------------------------------------------------------------------------------------------
const $option = UseOpenComOption();

// -- 資料 --------------------------------------------------------------------------------------------
type Props = {
  params: { id: number }; // 參數
}

const props = defineProps<Props>();

// 標題
const title = computed(() => {
  return `範例彈層【ID：${props.params.id}】`;
});
</script>

<template lang="pug">
ElModalPlus.OpenModalExampleInfo(
  v-model="$option.visible.value"
  type="info"
  :title="title"
  width="480px"
)
  OpenModalExampleInfoForm(
    :id="props.params.id"
    @on-close="$option.OnClose"
  )
  template(#footer="{ AskClose }")
    ElButton(@click="AskClose") 關閉
</template>
