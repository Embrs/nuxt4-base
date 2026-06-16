<script setup lang="ts">
// Error 錯誤頁：顯示狀態碼與訊息，並提供返回首頁
// -- 引入 --------------------------------------------------------------------------------------------
const { t } = useI18n();

// -- 資料 --------------------------------------------------------------------------------------------
type Props = {
  error: { statusCode: number, statusMessage: string }
}
const props = defineProps<Props>();

// -- 接收事件 -----------------------------------------------------------------------------------------
/** 點擊回首頁 */
const ClickGoHome = () => {
  clearError({ redirect: '/' });
};
</script>

<template lang="pug">
.Error
  p.Error__code {{ props.error.statusCode }}
  p.Error__msg {{ props.error.statusMessage }}
  p.Error__home-btn(@click="ClickGoHome") {{ t('common.goHome') }}
</template>

<style lang="scss" scoped>
// 佈局 ----
.Error {
  @include wh(100vw, 100vh);
  @include center-col(10px);
  color: white;
  background-color: $primary;
}

// 組件 ----
.Error__code {
  @include fs(100px);
  font-weight: 900;
}
.Error__msg {
  @include fs(30px);
  margin-bottom: 20px;
}
.Error__home-btn {
  @include fs(20px);
  @include center;
  cursor: pointer;
  padding: 10px 40px;
  border: 1px solid white;
  border-radius: 10px;
}
</style>
