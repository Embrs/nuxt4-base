<script setup lang="ts">
// OpenDrawerExampleInfo 範例資訊抽屜（$open 用法範本）
// -- 引入 --------------------------------------------------------------------------------------------
const $option = UseOpenComOption();

// -- 資料 --------------------------------------------------------------------------------------------
type Props = {
  params: { id: number }; // 參數
}

const props = defineProps<Props>();

const elForm = useTemplateRef('elForm');

// 標題
const title = computed(() => {
  return `範例資訊【ID：${props.params.id}】`;
});

// 準備就緒
const isReady = ref(false);

// -- 接收事件 -----------------------------------------------------------------------------------------
const ClickAction = $lodash.debounce(async (active: string) => {
  if ($option.isSendLock.value) return;
  $option.isSendLock.value = true;
  switch (active) {
    case 'delete': {
      await elForm.value?.DeleteFlow();
      break;
    }
    case 'edit': {
      await elForm.value?.OpenEditDrawer();
      break;
    }
  }
  $option.isSendLock.value = false;
}, 1000, { leading: true, trailing: false });

</script>

<template lang="pug">
ElDrawerPlus.OpenDrawerExampleInfo(
  v-model="$option.visible.value"
  :title="title"
  type="info"
  width="600px"
)
  OpenDrawerExampleInfoForm(
    :id="props.params.id"
    ref="elForm"
    v-model:isReady="isReady"
    @on-close="$option.OnClose"
  )
  template(v-if="isReady" #footer="{}")
    ElButton(
      :disabled="$option.isSendLock.value"
      type="danger"
      @click="ClickAction('delete')"
    ) 刪除
    ElButton(
      :disabled="$option.isSendLock.value"
      type="primary"
      @click="ClickAction('edit')"
    ) 編輯
</template>
