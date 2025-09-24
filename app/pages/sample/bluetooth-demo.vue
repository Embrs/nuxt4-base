<script setup lang="ts">
// -- 引入 -------------------------------------------------------------------------------------------
import {
  isBluetoothSupported,
  requestHealthDevice,
  connectHealthDevice,
  startHeartRateNotifications,
  startPulseOximeterNotifications,
  readHeartRateOnce,
  readPulseOximeterOnce,
  disconnectDevice,
  normalizeBluetoothError,
  type BluetoothHealthContext,
  type BluetoothNotificationStopper,
  type HeartRateMeasurement,
  type PulseOximeterMeasurement
} from '@/protocol/bluetooth';

// -- 狀態 -------------------------------------------------------------------------------------------
/** 已選擇的藍牙裝置。*/
const device = ref<BluetoothDevice | null>(null);
/** 目前的 GATT 連線內容。*/
const context = ref<BluetoothHealthContext | null>(null);

/** 控制連線流程的載入狀態。*/
const isConnecting = ref(false);
/** 控制單次讀取流程的載入狀態。*/
const isReading = ref(false);
/** 最近一次錯誤訊息。*/
const lastError = ref<string | null>(null);

/** 心率值 (bpm)。*/
const heartRate = ref<number | null>(null);
/** 心率消耗能量 (kJ)。*/
const energyExpended = ref<number | null>(null);
/** 心跳間期 (RR-Interval)。*/
const rrIntervals = ref<number[] | null>(null);
/** 心率資料更新時間。*/
const heartRateUpdatedAt = ref<number | null>(null);

/** 血氧值 (SpO₂%)。*/
const spo2 = ref<number | null>(null);
/** 血氧資料更新時間。*/
const spo2UpdatedAt = ref<number | null>(null);

/** 心率通知解除函式。*/
const heartRateStopper = ref<BluetoothNotificationStopper | null>(null);
/** 血氧通知解除函式。*/
const pulseStopper = ref<BluetoothNotificationStopper | null>(null);
/** 裝置斷線事件監聽器。*/
const disconnectHandler = ref<((event: Event) => void) | null>(null);

/** 確認當前環境是否支援 Web Bluetooth。*/
const isSupported = computed(() => isBluetoothSupported());
/** 判斷裝置是否處於連線中。*/
const isConnected = computed(() => Boolean(context.value?.server?.connected));
/** 顯示用的裝置名稱。*/
const deviceName = computed(() => context.value?.device.name ?? device.value?.name ?? '尚未選擇');

// -- 函式 -------------------------------------------------------------------------------------------
/** 重置量測數據。*/
const resetMeasurements = () => {
  heartRate.value = null;
  energyExpended.value = null;
  rrIntervals.value = null;
  heartRateUpdatedAt.value = null;
  spo2.value = null;
  spo2UpdatedAt.value = null;
};

/** 停止所有通知監聽。*/
const stopNotifications = async() => {
  const tasks: Promise<void>[] = [];

  if (heartRateStopper.value) {
    tasks.push(heartRateStopper.value());
    heartRateStopper.value = null;
  }
  if (pulseStopper.value) {
    tasks.push(pulseStopper.value());
    pulseStopper.value = null;
  }

  if (tasks.length) {
    await Promise.allSettled(tasks);
  }
};

/** 移除裝置斷線監聽器。*/
const cleanupDeviceListener = () => {
  if (device.value && disconnectHandler.value) {
    device.value.removeEventListener('gattserverdisconnected', disconnectHandler.value);
  }
  disconnectHandler.value = null;
};

/** 統一處理資源釋放。*/
const teardownConnection = async() => {
  await stopNotifications();
  cleanupDeviceListener();
  await disconnectDevice(context.value?.device ?? device.value);
  context.value = null;
  resetMeasurements();
};

/** 設定心率與血氧的通知監聽。*/
const setupNotifications = async(ctx: BluetoothHealthContext) => {
  await stopNotifications();

  if (ctx.heartRateCharacteristic) {
    heartRateStopper.value = await startHeartRateNotifications(
      ctx.heartRateCharacteristic,
      (measurement: HeartRateMeasurement) => {
        heartRate.value = measurement.heartRate ?? null;
        energyExpended.value = measurement.energyExpended ?? null;
        rrIntervals.value = measurement.rrIntervals ?? null;
        heartRateUpdatedAt.value = Date.now();
      }
    );
  }

  if (ctx.pulseOximeterCharacteristic) {
    pulseStopper.value = await startPulseOximeterNotifications(
      ctx.pulseOximeterCharacteristic,
      (measurement: PulseOximeterMeasurement) => {
        spo2.value = measurement.spo2 ?? null;
        heartRate.value = measurement.heartRate ?? heartRate.value;
        spo2UpdatedAt.value = Date.now();
      }
    );
  }
};

/** 讓使用者選擇藍牙裝置。*/
const handleChooseDevice = async(): Promise<boolean> => {
  if (!isSupported.value) {
    const message = '此瀏覽器不支援 Web Bluetooth，無法搜尋裝置。';
    lastError.value = message;
    ElMessage.error(message);
    return false;
  }

  try {
    const selectedDevice = await requestHealthDevice();
    device.value = selectedDevice;
    lastError.value = null;
    ElMessage.success(`已選擇裝置：${selectedDevice.name ?? '未命名裝置'}`);
    return true;
  }
  catch (error) {
    const message = normalizeBluetoothError(error);
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      // 使用者取消選擇裝置屬正常情況，不列為錯誤。
      ElMessage.info('未選擇任何裝置。');
      return false;
    }
    lastError.value = message;
    ElMessage.error(message);
    return false;
  }
};

/** 建立連線並啟動通知。*/
const handleConnect = async() => {
  if (isConnecting.value) {
    return;
  }

  if (!device.value) {
    const isSelected = await handleChooseDevice();
    if (!isSelected) {
      return;
    }
  }

  if (!device.value) {
    return;
  }

  isConnecting.value = true;
  lastError.value = null;

  try {
    await teardownConnection();

    const newContext = await connectHealthDevice(device.value);
    context.value = newContext;

    cleanupDeviceListener();
    const listener = () => {
      ElMessage.warning('藍牙裝置已中斷連線。');
      void handleDisconnect(false);
    };
    device.value.addEventListener('gattserverdisconnected', listener);
    disconnectHandler.value = listener;

    await setupNotifications(newContext);
    ElMessage.success('藍牙裝置連線成功，已啟動資料監聽。');
  }
  catch (error) {
    const message = normalizeBluetoothError(error);
    lastError.value = message;
    ElMessage.error(message);
  }
  finally {
    isConnecting.value = false;
  }
};

/** 單次讀取心率與血氧資料。*/
const handleReadOnce = async() => {
  if (isReading.value) {
    return;
  }
  if (!context.value) {
    ElMessage.warning('請先建立藍牙連線後再讀取資料。');
    return;
  }

  isReading.value = true;
  lastError.value = null;

  try {
    if (context.value.heartRateCharacteristic) {
      const measurement = await readHeartRateOnce(context.value.heartRateCharacteristic);
      heartRate.value = measurement.heartRate ?? null;
      energyExpended.value = measurement.energyExpended ?? null;
      rrIntervals.value = measurement.rrIntervals ?? null;
      heartRateUpdatedAt.value = Date.now();
    }

    if (context.value.pulseOximeterCharacteristic) {
      const measurement = await readPulseOximeterOnce(context.value.pulseOximeterCharacteristic);
      spo2.value = measurement.spo2 ?? null;
      heartRate.value = measurement.heartRate ?? heartRate.value;
      spo2UpdatedAt.value = Date.now();
    }

    ElMessage.success('已更新一次量測資料。');
  }
  catch (error) {
    const message = normalizeBluetoothError(error);
    lastError.value = message;
    ElMessage.error(message);
  }
  finally {
    isReading.value = false;
  }
};

/** 中斷藍牙連線並釋放資源。*/
const handleDisconnect = async(showMessage = true) => {
  if (!device.value && !context.value) {
    return;
  }

  await teardownConnection();

  if (showMessage) {
    ElMessage.success('已中斷藍牙連線。');
  }
};

/** 重新選擇藍牙裝置，並保留可再次連線的能力。*/
const handleReselectDevice = async() => {
  const selected = await handleChooseDevice();
  if (selected && isConnected.value) {
    // 若已連線，提醒使用者重新連線以更新特徵。
    ElMessage.warning('請重新連線以與新裝置同步。');
  }
};

/** 將時間戳格式化為可讀字串。*/
const formatTimestamp = (value: number | null) => {
  if (!value) {
    return '尚未更新';
  }
  return new Date(value).toLocaleTimeString();
};

/** 將 RR-Interval 轉為秒數字串。*/
const formatRrIntervals = (value: number[] | null) => {
  if (!value || value.length === 0) {
    return '尚未更新';
  }
  return value.map((interval) => `${interval.toFixed(2)} 秒`).join('、');
};

// -- 生命週期 -----------------------------------------------------------------------------------------
onBeforeUnmount(() => {
  void handleDisconnect(false);
});
</script>

<template lang="pug">
.SampleBluetoothDemo
  .SampleBluetoothDemo__header
    h1.SampleBluetoothDemo__title 藍牙健康資料示範
    p.SampleBluetoothDemo__desc 本頁示範如何透過 Web Bluetooth 連線支援心率與血氧的裝置，並讀取即時資料。

  ElAlert.SampleBluetoothDemo__alert(v-if="!isSupported" type="error" show-icon title="瀏覽器不支援 Web Bluetooth" description="請改用支援 Web Bluetooth 的桌面版 Chrome 或 Edge，或確認已開啟相關實驗功能。")

  template(v-else)
    ElCard.SampleBluetoothDemo__card
      template(#header)
        .SampleBluetoothDemo__cardHeader
          span 控制面板
          ElTag(:type="isConnected ? 'success' : device ? 'warning' : 'info'") {{ isConnected ? '已連線' : device ? '待連線' : '待選擇' }}

      .SampleBluetoothDemo__control
        .SampleBluetoothDemo__info
          p
            strong 裝置名稱：
            span {{ deviceName }}
          p
            strong 連線狀態：
            span {{ isConnected ? '已建立 GATT 連線' : '尚未連線' }}
          p
            strong 心率更新：
            span {{ formatTimestamp(heartRateUpdatedAt) }}
          p
            strong 血氧更新：
            span {{ formatTimestamp(spo2UpdatedAt) }}

        .SampleBluetoothDemo__actions
          ElButton(type="primary" :loading="isConnecting" @click="handleConnect") 選擇裝置並連線
          ElButton(type="success" :loading="isReading" :disabled="!isConnected || isReading" @click="handleReadOnce") 讀取一次資料
          ElButton(type="warning" plain :disabled="!device" @click="handleReselectDevice") 重新選擇裝置
          ElButton(type="danger" plain :disabled="!device" @click="handleDisconnect()") 中斷連線

    ElAlert.SampleBluetoothDemo__error(v-if="lastError" type="warning" show-icon :closable="false")
      template(#title) 操作提醒
      p {{ lastError }}

    ElCard.SampleBluetoothDemo__card
      template(#header)
        .SampleBluetoothDemo__cardHeader
          span 即時量測資料
          ElTag(:type="heartRate || spo2 ? 'success' : 'info'") {{ heartRate || spo2 ? '資料更新中' : '等待資料' }}

      .SampleBluetoothDemo__measurements
        .SampleBluetoothDemo__metric
          h3 心率 (bpm)
          p.SampleBluetoothDemo__metricValue {{ heartRate ?? '尚未更新' }}
          p.SampleBluetoothDemo__metricHint(v-if="energyExpended !== null") 消耗能量：{{ energyExpended }} kJ
          p.SampleBluetoothDemo__metricHint RR-Interval：{{ formatRrIntervals(rrIntervals) }}
        .SampleBluetoothDemo__metric
          h3 血氧 (SpO₂ %)
          p.SampleBluetoothDemo__metricValue {{ spo2 ?? '尚未更新' }}
          p.SampleBluetoothDemo__metricHint 資料更新時間：{{ formatTimestamp(spo2UpdatedAt) }}
</template>

<style scoped lang="scss">
.SampleBluetoothDemo {
  @include col(24px);
  padding: 32px;
}

.SampleBluetoothDemo__header {
  @include col(8px);
}

.SampleBluetoothDemo__title {
  margin: 0;
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
}

.SampleBluetoothDemo__desc {
  margin: 0;
  color: #475569;
  max-width: 680px;
  line-height: 1.6;
}

.SampleBluetoothDemo__alert {
  margin-top: 16px;
}

.SampleBluetoothDemo__card {
  margin-top: 24px;
}

.SampleBluetoothDemo__cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.SampleBluetoothDemo__control {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.SampleBluetoothDemo__info {
  flex: 1 1 320px;
  @include col(8px);
}

.SampleBluetoothDemo__actions {
  flex: 1 1 240px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.SampleBluetoothDemo__error {
  margin-top: 16px;
}

.SampleBluetoothDemo__measurements {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.SampleBluetoothDemo__metric {
  @include col(8px);
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.6);
}

.SampleBluetoothDemo__metricValue {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.SampleBluetoothDemo__metricHint {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

@media (max-width: 768px) {
  .SampleBluetoothDemo {
    padding: 24px 16px;
  }
}
</style>
