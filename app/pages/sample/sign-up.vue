<script setup lang="ts">
// -- 引入 -------------------------------------------------------------------------------------------
import type { FormInstance, FormRules } from 'element-plus';

// -- 資料 -------------------------------------------------------------------------------------------
/** 註冊表單欄位資料結構。*/
interface SignUpForm {
  account: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

/** 註冊 API 請求參數。*/
type SignUpPayload = {
  account: string;
  password: string;
};

/** 註冊 API 回傳資料結構。*/
interface SignUpApiResponse {
  status?: {
    code?: number;
    message?: string;
  };
}

/** Nuxt Router 實例，用於導頁。*/
const router = useRouter();

/** 註冊表單的 Element Plus 表單實例。*/
const formRef = ref<FormInstance>();
/** 註冊表單資料。*/
const form = reactive<SignUpForm>({
  account: '',
  password: '',
  confirmPassword: '',
  agree: false,
});

/** 註冊表單欄位驗證規則。*/
const rules = reactive<FormRules<SignUpForm>>({
  account: [
    { required: true, message: '請輸入帳號或 Email', trigger: 'blur' },
    { min: 4, message: '帳號至少需 4 個字元', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼至少需 6 個字元', trigger: 'blur' },
  ],
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('請再次輸入密碼'));
          return;
        }
        if (value !== form.password) {
          callback(new Error('兩次輸入的密碼不一致'));
          return;
        }
        callback();
      },
      trigger: ['blur', 'change'],
    },
  ],
  agree: [
    {
      validator: (_rule, value: boolean, callback) => {
        if (!value) {
          callback(new Error('請先閱讀並同意服務條款'));
          return;
        }
        callback();
      },
      trigger: 'change',
    },
  ],
});

/** 控制註冊按鈕送出狀態。*/
const isSubmitting = ref(false);

// -- 接收事件 -----------------------------------------------------------------------------------------
/** 當密碼變更時重新驗證確認欄位。*/
const OnPasswordChange = () => {
  if (!form.confirmPassword) return;
  formRef.value?.validateField('confirmPassword');
};

watch(() => form.password, OnPasswordChange);

/** 表單提交行為入口。*/
const ClickSubmit = async() => {
  if (isSubmitting.value) return false;

  isSubmitting.value = true;

  try {
    return await SignUpFlow();
  }
  finally {
    isSubmitting.value = false;
  }
};

// -- 流程 --------------------------------------------------------------------------------------------
/** 執行註冊流程。*/
const SignUpFlow = async() => {
  // 第一步：確認表單已初始化
  if (!formRef.value) {
    ElMessage.error('註冊表單尚未初始化');
    return false;
  }

  // 第二步：驗證表單欄位
  if (!await formRef.value.validate().catch(() => false)) {
    return false;
  }

  // 第三步：呼叫註冊 API 並檢查回傳狀態
  if (!await ApiSignUp({
    account: form.account,
    password: form.password,
  }).catch((error: unknown) => {
    const message = (error as { message?: string })?.message ?? '註冊失敗，請稍後再試';
    ElMessage.error(message);
    return false;
  })) {
    return false;
  }

  // 第四步：註冊成功提示並導向登入頁面
  ElMessage.success('註冊成功，請使用帳號登入');
  await router.push('/sample/sign-in');
  return true;
};

// -- 函式 --------------------------------------------------------------------------------------------
// (目前無額外工具函式)

// -- Api ---------------------------------------------------------------------------------------------
/** 呼叫註冊 API。*/
const ApiSignUp = async(payload: SignUpPayload) => {
  const res = await $api.SignUp(payload) as SignUpApiResponse;

  if (res?.status?.code === $enum.apiStatus.success) {
    return true;
  }

  const errorMessage = res?.status?.message ?? '註冊失敗，請稍後再試';
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
.SignUp
  //- -- 版面配置 ------------------------------------------------------------------------------------
  .SignUp__layout
    //- -- 插畫區 -------------------------------------------------------------------------------------
    .SignUp__illustration
      .SignUp__glow
      h2.SignUp__statement 與我們一同創造無限可能
      p.SignUp__sub 加入社群，展開屬於你的全新篇章。
    //- -- 表單面板 -----------------------------------------------------------------------------------
    .SignUp__panel
      .SignUp__header
        h1.SignUp__title 建立帳號 ✨
        p.SignUp__desc 請填寫以下資訊完成註冊並開啟旅程
      ElForm.SignUp__form(
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        status-icon
        @submit.prevent="ClickSubmit"
      )
        //- -- 帳號欄位 -------------------------------------------------------------------------------
        ElFormItem.SignUp__field(label="帳號或 Email" prop="account")
          ElInput(
            v-model="form.account"
            type="text"
            placeholder="請輸入帳號或 Email"
            autocomplete="username"
            maxlength="200"
            clearable
          )
        //- -- 密碼欄位 -------------------------------------------------------------------------------
        ElFormItem.SignUp__field(label="密碼" prop="password")
          ElInput(
            v-model="form.password"
            type="password"
            placeholder="請輸入密碼"
            show-password
            autocomplete="new-password"
            maxlength="200"
          )
        //- -- 確認密碼欄位 ---------------------------------------------------------------------------
        ElFormItem.SignUp__field(label="確認密碼" prop="confirmPassword")
          ElInput(
            v-model="form.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
            show-password
            autocomplete="new-password"
            maxlength="200"
          )
        //- -- 條款確認 -------------------------------------------------------------------------------
        ElFormItem.SignUp__terms(label-width="0" prop="agree")
          ElCheckbox(v-model="form.agree") 我已閱讀並同意
            NuxtLink.SignUp__link(to="/terms" target="_blank") 服務條款
        //- -- 表單操作按鈕 ---------------------------------------------------------------------------
        ElFormItem.SignUp__actions(label-width="0")
          ElButton.SignUp__submit(
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            round
            size="large"
          ) 建立帳號
        //- -- 回到登入 -------------------------------------------------------------------------------
        ElFormItem.SignUp__footer(label-width="0")
          span 已經有帳號了？
          NuxtLink.SignUp__link(to="/sample/sign-in") 立即登入
</template>

<style lang="scss" scoped>
.SignUp {
  // 註冊頁面外層容器樣式
  min-height: 100vh;
  padding: clamp(24px, 6vh, 80px);
  background: radial-gradient(circle at top right, #ccfbf1, #eef2ff 55%);
  color: $font;
  @include center();
}

.SignUp__layout {
  // 頁面主格局設定
  width: min(1040px, 100%);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  border-radius: 28px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 30px 60px -35px rgba(14, 165, 233, 0.45);
  border: 1px solid rgba(56, 189, 248, 0.24);
  backdrop-filter: blur(12px);
}

.SignUp__illustration {
  // 左側插畫區塊
  position: relative;
  padding: clamp(32px, 6vw, 72px);
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: $white;
  @include col(16px);
  justify-content: flex-end;
}

.SignUp__glow {
  // 插畫區內的光暈效果
  position: absolute;
  inset: 12% 18% 34% 12%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 60%);
  filter: blur(16px);
  pointer-events: none;
}

.SignUp__statement {
  // 插畫區主標語
  position: relative;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  line-height: 1.3;
}

.SignUp__sub {
  // 插畫區副標語
  position: relative;
  margin: 0;
  color: rgba(248, 250, 252, 0.85);
  @include fs(16px, 400);
}

.SignUp__panel {
  // 註冊表單面板
  background-color: $white;
  @include col(32px);
  padding: clamp(32px, 6vw, 72px);
}

.SignUp__header {
  // 表單標題區
  @include col(12px);
}

.SignUp__title {
  // 主標題樣式
  margin: 0;
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
}

.SignUp__desc {
  // 標題下的說明文字
  margin: 0;
  color: #475569;
  @include fs(16px, 400);
}

.SignUp__form {
  // ElForm 容器
  width: 100%;
  @include col(8px);
}

.SignUp__field {
  // 單一欄位容器
  width: 100%;
}

.SignUp__terms,
.SignUp__actions,
.SignUp__footer {
  // 共用的列表容器寬度
  width: 100%;
}

.SignUp__terms {
  // 條款確認區塊
  .el-form-item__content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.SignUp__actions {
  // 操作按鈕區塊
  width: 100%;
  margin-top: 8px;
}

.SignUp__submit {
  // 建立帳號按鈕樣式
  width: 100%;
  @include fs(18px, 600);
}

.SignUp__footer {
  // 返回登入資訊區塊
  width: 100%;
  color: #64748b;
  @include row(8px, center);
  justify-content: center;
}

.SignUp__link {
  // 表單內連結樣式
  font-weight: 600;
  color: $primary;
  transition: color 0.2s ease;

  &:hover {
    color: #2563eb;
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

:deep(.SignUp__field .el-form-item__content) {
  // 讓欄位內部容器全寬
  width: 100%;
}

:deep(.SignUp__field .el-input) {
  // 讓輸入框全寬
  width: 100%;
}

:deep(.SignUp__field .el-input__wrapper) {
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
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35);
  border-radius: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

:deep(.el-input__wrapper.is-focus) {
  // 輸入框聚焦效果
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.55);
  transform: translateY(-1px);
}

:deep(.el-input__inner) {
  // 輸入字體樣式
  @include fs(16px, 400);
}

:deep(.el-button.SignUp__submit) {
  // 建立帳號按鈕陰影
  box-shadow: 0 12px 24px -12px rgba(14, 165, 233, 0.6);
}

@include md {
  // 中型裝置以下版面調整
  .SignUp__layout {
    grid-template-columns: 1fr;
  }

  .SignUp__illustration {
    display: none;
  }

  .SignUp__panel {
    padding: clamp(28px, 8vw, 48px);
  }
}

</style>
