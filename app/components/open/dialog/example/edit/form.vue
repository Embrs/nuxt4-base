<script setup lang="ts">
// OpenDialogExampleEditForm 範例編輯表單
// -- 引入 --------------------------------------------------------------------------------------------
const $mitt = UseMitt();

// -- 資料 --------------------------------------------------------------------------------------------
type Props = {
  params: { id: number };
  resolve: (value: { id: number; name: string } | false) => void;
}

const props = defineProps<Props>();

// 加載中
const isLoading = ref(false);

// 表單
const elForm = useTemplateRef('elForm');
const form = reactive({
  name: ''
});

// 規則
const rules = {
  name: [{ required: true, message: '請輸入名稱', trigger: 'blur' }]
};

// -- 接收事件 -----------------------------------------------------------------------------------------
// 任一欄位變動 → 通知容器（用於關閉前的二次確認）
const ChangeForm = () => {
  emit('on-change');
};

// -- 流程 --------------------------------------------------------------------------------------------
/** 初始化 */
const InitFlow = async (): Promise<boolean> => {
  isLoading.value = true;
  try {
    // 範例：載入詳情 if (!await ApiGetInfo(props.params.id)) return false;
    form.name = props.params.id ? `範例 ${props.params.id}` : '';
    return true;
  } catch (err) {
    return false;
  } finally {
    isLoading.value = false;
  }
};

/** 送出流程 */
const SubmitFlow = async (): Promise<boolean> => {
  isLoading.value = true;
  try {
    // 表單驗證
    const valid = await elForm.value?.validate().catch(() => false);
    if (!valid) return false;
    // 範例：送出 API const res = await ApiSave(form); if (!res) return false;
    const result = { id: props.params.id, name: form.name };
    ElMessage.success('儲存成功');
    // 通知外層列表局部刷新（與部署版本自動更新互不影響）
    $mitt.EmitReload();
    // 回傳結果給呼叫端：await $open.DialogExampleEdit(id) 可取得 result
    props.resolve(result);
    // 關閉（容器移除 → Promise 已先以 result 解析，後續 resolve(false) 自動失效）
    EmitClose();
    return true;
  } catch (err) {
    return false;
  } finally {
    isLoading.value = false;
  }
};

// -- 生命週期 -----------------------------------------------------------------------------------------
onMounted(async () => {
  if (!await InitFlow()) EmitClose();
});

// -- 發送事件 -----------------------------------------------------------------------------------------
type Emit = { 'on-change': []; 'on-close': [] }
const emit = defineEmits<Emit>();

const EmitClose = () => {
  emit('on-close');
};

// -- 對外暴露 ----------------------------------------------------------------------------------------
defineExpose({
  SubmitFlow
});
</script>

<template lang="pug">
.OpenDialogExampleEditForm(v-loading="isLoading")
  ElForm(
    ref="elForm"
    :model="form"
    :rules="rules"
    label-position="top"
    size="large"
    require-asterisk-position="right"
  )
    //- 基本資料區 ----------------------------------------------
    .g-form-title 基本資料
    ElFormItem(label="名稱" prop="name")
      ElInput(
        v-model="form.name"
        maxlength="50"
        placeholder="請輸入名稱"
        clearable
        @input="ChangeForm"
      )
</template>

<style lang="scss" scoped>
// 佈局 ----
.OpenDialogExampleEditForm {
  min-height: 120px;
}
</style>
