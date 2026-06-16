<script setup lang="ts">
// ElModalPlus 彈層基底（不依賴 ElDialog，純自訂遮罩置中彈層）
// 與 ElDialogPlus / ElDrawerPlus 共用同一套使用慣例：v-model 控制開關、isChange 觸發二次確認、footer slot 提供 AskClose。
// -- 引入 --------------------------------------------------------------------------------------------
import { useZIndex } from 'element-plus';

const $ask = UseAsk();
const storeTool = StoreTool();
const $lock = UseLockScroll();

// 根節點為 Teleport，關閉自動繼承避免落點告警；改於 .ElModalPlus 顯式 v-bind="$attrs"，
// 讓 class／id／data-* 等 fallthrough 屬性仍正常落到可視根節點（對齊 dialog-plus / drawer-plus）。
defineOptions({ inheritAttrs: false });

// 層級：跟隨 Element Plus 的遞增計數器取號，避免與既有 EP 彈層搶層級而被遮蔽
const { nextZIndex } = useZIndex();
const zIndex = nextZIndex();

// -- 資料 --------------------------------------------------------------------------------------------
const visible = defineModel({
  type: Boolean,
  default: false
});

type Props = {
  width?: string // 正常寬度
  title?: string // 標題
  type?: 'edit' | 'info' // 編輯 一般模式
  isChange?: boolean // 是否被改過
  hiddenHeader?: boolean // 隱藏 header
  hiddenFooter?: boolean // 隱藏 footer
  isRemovePadding?: boolean // 是否移除 body padding
  closeOnClickMask?: boolean // 點擊遮罩是否關閉
}

const props = withDefaults(defineProps<Props>(), {
  width: '400px',
  title: '',
  type: 'info',
  isChange: false,
  hiddenHeader: false,
  hiddenFooter: false,
  isRemovePadding: false,
  closeOnClickMask: true
});

// 響應式寬度（行動裝置滿版）
const boxWidth = computed(() => (storeTool.isMobile ? '95%' : props.width));

// -- 接收事件 -----------------------------------------------------------------------------------------
// 統一關閉（有變更時跳二次確認）
const OnHandleClose = async () => {
  if (!props.isChange) {
    visible.value = false;
    return;
  }
  if (await $ask.ChangeClose()) {
    visible.value = false;
  }
};

// 點擊遮罩
const ClickMask = () => {
  if (!props.closeOnClickMask) return;
  OnHandleClose();
};

// -- 生命週期 -----------------------------------------------------------------------------------------
// 開啟期間鎖定背景捲動，元件卸載（離場動畫結束後容器移除）時還原
onMounted(() => {
  $lock.Lock();
});

onBeforeUnmount(() => {
  $lock.Unlock();
});

// -- 發送事件 -----------------------------------------------------------------------------------------
type Emit = { 'on-close': [] }
const emit = defineEmits<Emit>();

// 離場動畫結束後才通知容器移除（對齊 ElDialog 的 @closed 時機）
const EmitClose = () => {
  emit('on-close');
};
</script>

<template lang="pug">
Teleport(to="body")
  Transition(name="g-modal" appear @after-leave="EmitClose")
    .ElModalPlus(
      v-if="visible"
      v-bind="$attrs"
      :style="{ zIndex }"
      @click.self="ClickMask"
    )
      .ElModalPlus__box(:data-type="props.type" :style="{ width: boxWidth }")
        //- 標題列
        .ElModalPlus__header(v-if="!props.hiddenHeader")
          slot(name="header")
            span.ElModalPlus__title {{ props.title }}
          button.ElModalPlus__close(type="button" @click="OnHandleClose") ✕
        //- 內容
        .ElModalPlus__body(:class="{ 'ElModalPlus__body--flush': props.isRemovePadding }")
          slot
        //- 底部
        .ElModalPlus__footer(v-if="!props.hiddenFooter")
          slot(name="footer" :AskClose="OnHandleClose")
</template>

<style lang="scss" scoped>
// 佈局 ----
.ElModalPlus {
  @include fixed("fill");
  @include center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.45);
  // z-index 由 script 透過 Element Plus useZIndex 動態指派（見 :style）
}

.ElModalPlus__box {
  display: grid;
  grid-template-rows: auto 1fr auto;
  max-width: 100%;
  max-height: 90vh;
  overflow: hidden;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.ElModalPlus__header {
  @include row(10px);
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
}

.ElModalPlus__title {
  font-weight: 700;
}

.ElModalPlus__close {
  @include btn-click;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  color: inherit;
}

.ElModalPlus__body {
  overflow: auto;
  padding: 20px;
}

.ElModalPlus__body--flush {
  padding: 0;
}

.ElModalPlus__footer {
  @include row(10px);
  justify-content: flex-end;
  min-height: 54px;
  padding: 10px 20px;
  border-top: 1px solid #eee;
}

// 主題 ----
.ElModalPlus__box[data-type="info"] .ElModalPlus__header {
  background-color: #fff;
}

.ElModalPlus__box[data-type="info"] .ElModalPlus__title,
.ElModalPlus__box[data-type="info"] .ElModalPlus__close {
  color: var(--primary);
}

.ElModalPlus__box[data-type="edit"] .ElModalPlus__header {
  background-color: var(--primary);
}

.ElModalPlus__box[data-type="edit"] .ElModalPlus__title,
.ElModalPlus__box[data-type="edit"] .ElModalPlus__close {
  color: #fff;
}

// 動畫 ----
.g-modal-enter-active,
.g-modal-leave-active {
  transition: opacity 0.25s ease;
}

.g-modal-enter-active .ElModalPlus__box,
.g-modal-leave-active .ElModalPlus__box {
  transition: transform 0.25s ease;
}

.g-modal-enter-from,
.g-modal-leave-to {
  opacity: 0;
}

.g-modal-enter-from .ElModalPlus__box,
.g-modal-leave-to .ElModalPlus__box {
  transform: translateY(20px) scale(0.96);
}
</style>
