<script setup lang="ts">
// -- 引入 -------------------------------------------------------------------------------------------
import type { FormInstance, FormRules } from 'element-plus';

// -- 資料 -------------------------------------------------------------------------------------------
/** 登入表單欄位資料結構。*/
interface SignInForm {
  account: string;
  password: string;
  remember: boolean;
}

/** 登入 API 請求參數。*/
type SignInPayload = {
  account: string;
  password: string;
};

/** 登入後使用者資料。*/
type SignInUser = Record<string, unknown>;

/** 登入 API 回傳資料結構。*/
interface SignInApiResponse {
  status?: {
    code?: number;
    message?: string;
  };
  data?: {
    token?: string;
    user?: SignInUser | null;
  };
}

/** Nuxt Router 實例，用於導頁。*/
const router = useRouter();

/** 登入表單的 Element Plus 表單實例。*/
const formRef = ref<FormInstance>();
/** 登入表單資料。*/
const form = reactive<SignInForm>({
  account: '',
  password: '',
  remember: true,
});

/** 登入表單欄位驗證規則。*/
const rules = reactive<FormRules<SignInForm>>({
  account: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 4, message: '帳號至少需 4 個字元', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼至少需 6 個字元', trigger: 'blur' },
  ],
});

/** 控制登入按鈕送出狀態。*/
const isSubmitting = ref(false);
/** 儲存登入後的 Token。*/
const signInToken = useState<string | null>('sign-in:token', () => null);
/** 儲存登入後的使用者資訊。*/
const signInUser = useState<SignInUser | null>('sign-in:user', () => null);

// -- 接收事件 -----------------------------------------------------------------------------------------
/** 表單提交行為入口。*/
const ClickSubmit = async() => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await SignInFlow();
  }
  finally {
    isSubmitting.value = false;
  }
};

// -- 流程 --------------------------------------------------------------------------------------------
/** 執行登入流程，使用衛語句串接步驟。*/
const SignInFlow = async() => {
  // 第一步：確認表單已初始化
  if (!formRef.value) {
    ElMessage.error('登入表單尚未初始化');
    return;
  }

  // 第二步：驗證表單欄位
  const isValid = await formRef.value.validate().catch(() => false);
  if (!isValid) {
    return;
  }

  // 第三步：呼叫登入 API 並檢查回傳狀態
  const isSuccess = await ApiSignInTest({
    account: form.account,
    password: form.password,
  }).catch((error: unknown) => {
    const message = (error as { message?: string })?.message ?? '登入失敗，請稍後再試';
    ElMessage.error(message);
    return false;
  });
  if (!isSuccess) {
    return;
  }

  // 第四步：登入成功，提示並導向首頁
  ElMessage.success('登入成功，歡迎回來！');
  await router.push('/');
};

// -- 函式 --------------------------------------------------------------------------------------------
// (目前無額外工具函式)

// -- Api ---------------------------------------------------------------------------------------------
/** 呼叫登入 API。*/
const ApiSignInTest = async(payload: SignInPayload) => {
  const res = await $api.SignIn(payload) as SignInApiResponse;

  if (res?.status?.code === $enum.apiStatus.success) {
    const token = res?.data?.token ?? null;
    if (!token) {
      ElMessage.error('未取得授權資訊，請重新嘗試登入');
      return false;
    }

    const user = res?.data?.user ?? null;
    if (!user) {
      ElMessage.error('未取得用戶資訊，請稍後再試');
      return false;
    }

    signInToken.value = token;
    signInUser.value = user;
    return true;
  }

  const errorMessage = res?.status?.message ?? '登入失敗，請稍後再試';
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
.SignIn
  //- -- 版面配置 ------------------------------------------------------------------------------------
  .SignIn__layout
    //- -- 插畫區 -------------------------------------------------------------------------------------
    .SignIn__illustration
      .SignIn__glow
      h2.SignIn__statement 讓每一次登入都成為美好開始
      p.SignIn__sub 專注目標，開啟今日的全新挑戰。
    //- -- 表單面板 -----------------------------------------------------------------------------------
    .SignIn__panel
      .SignIn__header
        h1.SignIn__title 歡迎回來 👋
        p.SignIn__desc 請輸入您的帳號與密碼以繼續使用服務
      ElForm.SignIn__form(
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        status-icon
        @submit.prevent="ClickSubmit"
      )
        //- -- 帳號欄位 -------------------------------------------------------------------------------
        ElFormItem.SignIn__field(label="帳號" prop="account")
          ElInput(
            v-model="form.account"
            type="text"
            placeholder="請輸入帳號"
            autocomplete="username"
            maxlength="200"
            clearable
          )
        //- -- 密碼欄位 -------------------------------------------------------------------------------
        ElFormItem.SignIn__field(label="密碼" prop="password")
          ElInput(
            v-model="form.password"
            placeholder="請輸入密碼"
            type="password"
            show-password
            autocomplete="current-password"
            maxlength="200"
          )
        //- -- 表單輔助資訊 ---------------------------------------------------------------------------
        ElFormItem.SignIn__helper(label-width="0")
          .SignIn__helperInner
            ElCheckbox(v-model="form.remember") 記住我
            NuxtLink.SignIn__link(to="/sample/forgot-password") 忘記密碼？
        //- -- 表單操作按鈕 ---------------------------------------------------------------------------
        ElFormItem.SignIn__actions(label-width="0")
          ElButton.SignIn__submit(
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            round
            size="large"
          ) 登入
        //- -- 註冊導引 -------------------------------------------------------------------------------
        ElFormItem.SignIn__footer(label-width="0")
          span 還沒有帳號？
          NuxtLink.SignIn__link(to="/sample/sign-up") 立即註冊
</template>

<style lang="scss" scoped>
.SignIn {
  // 登入頁面外層容器樣式
  min-height: 100vh;
  padding: clamp(24px, 6vh, 80px);
  background: radial-gradient(circle at top right, #e0e7ff, #f8fafc 55%);
  color: $font;
  @include center();
}

.SignIn__layout {
  // 頁面主格局設定
  width: min(1040px, 100%);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  border-radius: 28px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 30px 60px -35px rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(12px);
}

.SignIn__illustration {
  // 左側插畫區塊
  position: relative;
  padding: clamp(32px, 6vw, 72px);
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: $white;
  @include col(16px);
  justify-content: flex-end;
}

.SignIn__glow {
  // 插畫區內的光暈效果
  position: absolute;
  inset: 10% 15% 35% 10%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent 60%);
  filter: blur(16px);
  pointer-events: none;
}

.SignIn__statement {
  // 插畫區主標語
  position: relative;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  line-height: 1.3;
}

.SignIn__sub {
  // 插畫區副標語
  position: relative;
  margin: 0;
  color: rgba(248, 250, 252, 0.85);
  @include fs(16px, 400);
}

.SignIn__panel {
  // 登入表單面板
  background-color: $white;
  @include col(32px);
  padding: clamp(32px, 6vw, 72px);
}

.SignIn__header {
  // 表單標題區
  @include col(12px);
}

.SignIn__title {
  // 主標題樣式
  margin: 0;
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
}

.SignIn__desc {
  // 標題下的說明文字
  margin: 0;
  color: #475569;
  @include fs(16px, 400);
}

.SignIn__form {
  // ElForm 容器
  width: 100%;
  @include col(8px);
}

.SignIn__field {
  // 單一欄位容器
  width: 100%;
}

.SignIn__helper,
.SignIn__actions,
.SignIn__footer {
  // 共用的列表容器寬度
  width: 100%;
}

.SignIn__helperInner {
  // 表單輔助資訊排版
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.SignIn__actions {
  // 操作按鈕區塊
  width: 100%;
  margin-top: 8px;
}

.SignIn__submit {
  // 登入按鈕樣式
  width: 100%;
  @include fs(18px, 600);
}

.SignIn__footer {
  // 註冊資訊區塊
  width: 100%;
  color: #64748b;
  @include row(8px, center);
  justify-content: center;
}

.SignIn__link {
  // 表單內連結樣式
  font-weight: 600;
  color: $primary;
  transition: color 0.2s ease;

  &:hover {
    color: #4338ca;
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

:deep(.SignIn__field .el-form-item__content) {
  // 讓欄位內部容器全寬
  width: 100%;
}

:deep(.SignIn__field .el-input) {
  // 讓輸入框全寬
  width: 100%;
}

:deep(.SignIn__field .el-input__wrapper) {
  // 讓輸入框外層包裹全寬
  width: 100%;
}

:deep(.SignIn__helper .el-form-item__content) {
  // 調整輔助資訊的內邊距
  padding-right: 0;
}

:deep(.SignIn__helperInner .el-checkbox__label) {
  // 調整勾選文字顏色
  color: #475569;
}

:deep(.el-form-item__label) {
  // 標籤顯示樣式
  font-weight: 600;
  color: #1f2937;
}

:deep(.el-input__wrapper) {
  // 輸入框包裹樣式
  padding: 10px 14px;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.35);
  border-radius: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

:deep(.el-input__wrapper.is-focus) {
  // 輸入框聚焦效果
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.55);
  transform: translateY(-1px);
}

:deep(.el-input__inner) {
  // 輸入字體樣式
  @include fs(16px, 400);
}

:deep(.el-checkbox__inner) {
  // Checkbox 樣式
  border-radius: 6px;
}

:deep(.el-button.SignIn__submit) {
  // 登入按鈕陰影
  box-shadow: 0 12px 24px -12px rgba(79, 70, 229, 0.6);
}

@include md {
  // 中型裝置以下版面調整
  .SignIn__layout {
    grid-template-columns: 1fr;
  }

  .SignIn__illustration {
    display: none;
  }

  .SignIn__panel {
    padding: clamp(28px, 8vw, 48px);
  }
}

</style>
