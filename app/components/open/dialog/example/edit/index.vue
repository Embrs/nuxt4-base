<script setup lang="ts">
// OpenDialogExampleEdit 範例編輯彈窗（$open 用法範本：示範 await 取得 resolve 回傳值）
// -- 引入 --------------------------------------------------------------------------------------------
const $option = UseOpenComOption();

// -- 資料 --------------------------------------------------------------------------------------------
type Props = {
  params: { id: number }; // 參數
  resolve: (value: { id: number; name: string } | false) => void; // 由容器（OpenGroup）注入的回傳
}

const props = defineProps<Props>();

const elForm = useTemplateRef('elForm');

// 標題
const title = computed(() => {
  return props.params.id ? `編輯範例【ID：${props.params.id}】` : '新增範例';
});

// -- 接收事件 -----------------------------------------------------------------------------------------
const ClickSubmit = $lodash.debounce(async () => {
  if ($option.isSendLock.value) return;
  $option.isSendLock.value = true;
  await elForm.value?.SubmitFlow();
  $option.isSendLock.value = false;
}, 1000, { leading: true, trailing: false });
</script>

<template lang="pug">
ElDialogPlus.OpenDialogExampleEdit(
  v-model="$option.visible.value"
  type="edit"
  :title="title"
  :isChange="$option.isChange.value"
  width="700px"
)
  OpenDialogExampleEditForm(
    ref="elForm"
    :params="props.params"
    :resolve="props.resolve"
    @on-change="$option.OnChange"
    @on-close="$option.OnClose"
  )
  template(#footer="{ AskClose }")
    ElButton(@click="AskClose") 取消
    ElButton(
      :disabled="$option.isSendLock.value"
      type="primary"
      @click="ClickSubmit"
    ) 確定
</template>
