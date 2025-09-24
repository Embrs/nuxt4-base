<script setup lang="ts">
// -- 引入 -------------------------------------------------------------------------------------------
import type { FormInstance, FormRules } from 'element-plus';

// -- 資料 -------------------------------------------------------------------------------------------
/** 忘記密碼表單欄位資料結構。*/
interface ForgotPasswordForm {
  account: string;
}

/** 忘記密碼 API 請求參數。*/
type ForgotPasswordPayload = {
  account: string;
};

/** 忘記密碼 API 回傳資料結構。*/
interface ForgotPasswordApiResponse {
  status?: {
    code?: number;
    message?: string;
  };
}

/** 登入路由器實例，用於導向登入頁面。*/
const router = useRouter();

/** 忘記密碼表單的 Element Plus 表單實例。*/
const formRef = ref<FormInstance>();
/** 忘記密碼表單資料。*/
const form = reactive<ForgotPasswordForm>({
  account: '',
});

/** 忘記密碼表單欄位驗證規則。*/
const rules = reactive<FormRules<ForgotPasswordForm>>({
  account: [
    { required: true, message: '請輸入帳號或 Email', trigger: 'blur' },
    { min: 4, message: '帳號至少需 4 個字元', trigger: 'blur' },
  ],
});

/** 控制送出按鈕狀態。*/
const isSubmitting = ref(false);

// -- 接收事件 -----------------------------------------------------------------------------------------
/** 表單提交行為入口。*/
const ClickSubmit = async() => {
  if (isSubmitting.value) return false;

  isSubmitting.value = true;

  try {
    return await ForgotPasswordFlow();
  }
  finally {
    isSubmitting.value = false;
  }
};

// -- 流程 --------------------------------------------------------------------------------------------
/** 執行忘記密碼流程。*/
const ForgotPasswordFlow = async() => {
  // 第一步：確認表單已初始化
  if (!formRef.value) {
    ElMessage.error('忘記密碼表單尚未初始化');
    return false;
  }

  // 第二步：驗證表單欄位
  if (!await formRef.value.validate().catch(() => false)) {
    return false;
  }

  // 第三步：呼叫忘記密碼 API 並檢查回傳狀態
  if (!await ApiForgotPassword({
    account: form.account,
  }).catch((error: unknown) => {
    const message = (error as { message?: string })?.message ?? '請求失敗，請稍後再試';
    ElMessage.error(message);
    return false;
  })) {
    return false;
  }

  // 第四步：通知使用者確認信件並導向登入頁面
  ElMessage.success('重設密碼連結已寄出，請前往信箱完成後續步驟');
  await router.push('/sign-in');
  return true;
};

// -- 函式 --------------------------------------------------------------------------------------------
// (目前無額外工具函式)

// -- Api ---------------------------------------------------------------------------------------------
/** 呼叫忘記密碼 API。*/
const ApiForgotPassword = async(payload: ForgotPasswordPayload) => {
  const res = await $api.ForgotPassword(payload) as ForgotPasswordApiResponse;

  if (res?.status?.code === $enum.apiStatus.success) {
    return true;
  }

  const errorMessage = res?.status?.message ?? '請求失敗，請稍後再試';
  ElMessage.error(errorMessage);
  return false;
};

// -- 生命週期 -----------------------------------------------------------------------------------------
// (目前無需生命週期鉤子)

// -- 發送事件 -----------------------------------------------------------------------------------------
// (目前無需對外發送事件)

// -- 對外暴露 -----------------------------------------------------------------------------------------
// (目前無需對外暴露成員)
</script>

<template lang="pug">
.ForgotPassword
  //- -- 版面配置 ------------------------------------------------------------------------------------
  .ForgotPassword__layout
    //- -- 插畫區 -------------------------------------------------------------------------------------
    .ForgotPassword__illustration
      .ForgotPassword__glow
      h2.ForgotPassword__statement 找回帳號的信心始於此刻
      p.ForgotPassword__sub 只需一步，即可重新啟動您的旅程。
    //- -- 表單面板 -----------------------------------------------------------------------------------
    .ForgotPassword__panel
      .ForgotPassword__header
        h1.ForgotPassword__title 忘記密碼 🔐
        p.ForgotPassword__desc 請輸入您的帳號或 Email，我們將寄出重設密碼的連結
      ElForm.ForgotPassword__form(
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        status-icon
        @submit.prevent="ClickSubmit"
      )
        //- -- 帳號欄位 -------------------------------------------------------------------------------
        ElFormItem.ForgotPassword__field(label="帳號或 Email" prop="account")
          ElInput(
            v-model="form.account"
            type="text"
            placeholder="請輸入帳號或 Email"
            autocomplete="username"
            maxlength="200"
            clearable
          )
        //- -- 提示資訊 -------------------------------------------------------------------------------
        ElFormItem.ForgotPassword__helper(label-width="0")
          .ForgotPassword__helperInner
            p 請確認輸入的帳號或 Email 正確無誤，以利快速收到重設連結。
        //- -- 表單操作按鈕 ---------------------------------------------------------------------------
        ElFormItem.ForgotPassword__actions(label-width="0")
          ElButton.ForgotPassword__submit(
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            round
            size="large"
          ) 寄送重設連結
        //- -- 返回登入 -------------------------------------------------------------------------------
        ElFormItem.ForgotPassword__footer(label-width="0")
          span 想起密碼了？
          NuxtLink.ForgotPassword__link(to="/sample/sign-in") 回到登入頁面
</template>

<style lang="scss" scoped>
.ForgotPassword {
  // 忘記密碼頁面外層容器樣式
  min-height: 100vh;
  padding: clamp(24px, 6vh, 80px);
  background: radial-gradient(circle at top right, #fee2e2, #fdf2f8 55%);
  color: $font;
  @include center();
}

.ForgotPassword__layout {
  // 頁面主格局設定
  width: min(1040px, 100%);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  border-radius: 28px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 30px 60px -35px rgba(190, 24, 93, 0.45);
  border: 1px solid rgba(244, 114, 182, 0.25);
  backdrop-filter: blur(12px);
}

.ForgotPassword__illustration {
  // 左側插畫區塊
  position: relative;
  padding: clamp(32px, 6vw, 72px);
  background: linear-gradient(135deg, #ec4899, #f97316);
  color: $white;
  @include col(16px);
  justify-content: flex-end;
}

.ForgotPassword__glow {
  // 插畫區內的光暈效果
  position: absolute;
  inset: 12% 18% 34% 12%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.45), transparent 60%);
  filter: blur(16px);
  pointer-events: none;
}

.ForgotPassword__statement {
  // 插畫區主標語
  position: relative;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  line-height: 1.3;
}

.ForgotPassword__sub {
  // 插畫區副標語
  position: relative;
  margin: 0;
  color: rgba(248, 250, 252, 0.85);
  @include fs(16px, 400);
}

.ForgotPassword__panel {
  // 忘記密碼表單面板
  background-color: $white;
  @include col(32px);
  padding: clamp(32px, 6vw, 72px);
}

.ForgotPassword__header {
  // 表單標題區
  @include col(12px);
}

.ForgotPassword__title {
  // 主標題樣式
  margin: 0;
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
}

.ForgotPassword__desc {
  // 標題下的說明文字
  margin: 0;
  color: #475569;
  @include fs(16px, 400);
}

.ForgotPassword__form {
  // ElForm 容器
  width: 100%;
  @include col(8px);
}

.ForgotPassword__field {
  // 單一欄位容器
  width: 100%;
}

.ForgotPassword__helper,
.ForgotPassword__actions,
.ForgotPassword__footer {
  // 共用的列表容器寬度
  width: 100%;
}

.ForgotPassword__helperInner {
  // 表單輔助資訊排版
  width: 100%;
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(244, 114, 182, 0.08);
  color: #9d174d;
  @include fs(14px, 400);
}

.ForgotPassword__actions {
  // 操作按鈕區塊
  width: 100%;
  margin-top: 8px;
}

.ForgotPassword__submit {
  // 寄送重設連結按鈕樣式
  width: 100%;
  @include fs(18px, 600);
}

.ForgotPassword__footer {
  // 返回登入資訊區塊
  width: 100%;
  color: #64748b;
  @include row(8px, center);
  justify-content: center;
}

.ForgotPassword__link {
  // 表單內連結樣式
  font-weight: 600;
  color: $primary;
  transition: color 0.2s ease;

  &:hover {
    color: #d946ef;
  }
}

:deep(.el-form) {
  // 調整 ElForm 寬度
  width: 100%;
}

:deep(.el-form-item) {
  // 調整 ElFormItem 間距
  margin-bottom: 18px;
}

:deep(.ForgotPassword__field .el-form-item__content) {
  // 讓欄位內部容器全寬
  width: 100%;
}

:deep(.ForgotPassword__field .el-input) {
  // 讓輸入框全寬
  width: 100%;
}

:deep(.ForgotPassword__field .el-input__wrapper) {
  // 讓輸入框外層包裹全寬
  width: 100%;
}

:deep(.el-form-item__label) {
  // 標籤顯示樣式
  font-weight: 600;
  color: #1f2937;
}

:deep(.el-input__wrapper) {
  // 輸入框包裹樣式
  padding: 10px 14px;
  box-shadow: 0 0 0 1px rgba(244, 114, 182, 0.35);
  border-radius: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

:deep(.el-input__wrapper.is-focus) {
  // 輸入框聚焦效果
  box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.55);
  transform: translateY(-1px);
}

:deep(.el-input__inner) {
  // 輸入字體樣式
  @include fs(16px, 400);
}

:deep(.el-button.ForgotPassword__submit) {
  // 寄送重設連結按鈕陰影
  box-shadow: 0 12px 24px -12px rgba(236, 72, 153, 0.6);
}

@include md {
  // 中型裝置以下版面調整
  .ForgotPassword__layout {
    grid-template-columns: 1fr;
  }

  .ForgotPassword__illustration {
    display: none;
  }

  .ForgotPassword__panel {
    padding: clamp(28px, 8vw, 48px);
  }
}

</style>
