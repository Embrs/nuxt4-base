/// <reference types="web-bluetooth" />
/**
 * 藍牙健康讀取模組，封裝與心率、血氧等 BLE 裝置互動的常用流程。
 * 主要利用 Web Bluetooth API 與標準 GATT Service / Characteristic 進行連線與資料解析。
 */

// -- 常數 ---------------------------------------------------------------------------------------------------
/** 心率服務 UUID。*/
export const HEART_RATE_SERVICE_UUID: BluetoothServiceUUID = 0x180d;
/** 心率量測特徵 UUID。*/
export const HEART_RATE_MEASUREMENT_CHAR_UUID: BluetoothCharacteristicUUID = 0x2a37;

/** 血氧服務 UUID（Pulse Oximeter Service）。*/
export const PULSE_OXIMETER_SERVICE_UUID: BluetoothServiceUUID = 0x1822;
/** 血氧連續量測特徵 UUID。*/
export const PULSE_OXIMETER_CONTINUOUS_CHAR_UUID: BluetoothCharacteristicUUID = 0x2a5f;
/** 血氧即時量測（Spot-Check）特徵 UUID。*/
export const PULSE_OXIMETER_SPOT_CHECK_CHAR_UUID: BluetoothCharacteristicUUID = 0x2a5e;

/** 電量服務 UUID，可作為附加資料來源。*/
export const BATTERY_SERVICE_UUID: BluetoothServiceUUID = 0x180f;

// -- 型別 ---------------------------------------------------------------------------------------------------
/** 心率量測資料結構。*/
export interface HeartRateMeasurement {
  heartRate: number | null;
  contactDetected: boolean;
  energyExpended?: number | null;
  rrIntervals?: number[];
  raw: DataView;
}

/** 血氧量測資料結構。*/
export interface PulseOximeterMeasurement {
  spo2: number | null;
  heartRate: number | null;
  raw: DataView;
}

/** 擴充後的藍牙裝置請求參數，方便在程式內進行條件檢查。*/
type EnhancedRequestDeviceOptions = RequestDeviceOptions & {
  filters?: BluetoothLEScanFilter[];
  acceptAllDevices?: boolean;
};

/** BLE 連線情境資料。*/
export interface BluetoothHealthContext {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  pulseOximeterCharacteristic: BluetoothRemoteGATTCharacteristic | null;
}

/** 特徵通知解除函式。*/
export type BluetoothNotificationStopper = () => Promise<void>;

// -- 工具函式 -----------------------------------------------------------------------------------------------
/** 確認當前環境是否支援 Web Bluetooth API。*/
export const isBluetoothSupported = (): boolean => typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);

/** 取得藍牙物件，若不支援則拋出錯誤。*/
const ensureBluetooth = (): Bluetooth => {
  if (typeof navigator === 'undefined' || !navigator.bluetooth) {
    throw new Error('此環境不支援 Web Bluetooth API，請改用支援的瀏覽器 (如 Chrome 專案)。');
  }
  return navigator.bluetooth;
};

/**
 * 建立預設的裝置搜尋條件，提供心率與血氧裝置所需的服務 UUID。
 */
const createDefaultRequestOptions = (): EnhancedRequestDeviceOptions => ({
  filters: [
    { services: [HEART_RATE_SERVICE_UUID] },
    { services: [PULSE_OXIMETER_SERVICE_UUID] }
  ],
  optionalServices: [
    HEART_RATE_SERVICE_UUID,
    PULSE_OXIMETER_SERVICE_UUID,
    BATTERY_SERVICE_UUID
  ]
});

/** 解析 SFLOAT 型別（Bluetooth GATT 常用格式）。*/
const parseSfloat = (view: DataView, offset: number): number | null => {
  if (offset + 2 > view.byteLength) {
    return null;
  }
  const raw = view.getUint16(offset, true);
  if (raw === 0x07ff) {
    return null; // 0x07FF 為無效資料代碼
  }
  let mantissa = raw & 0x0fff;
  if (mantissa >= 0x0800) {
    mantissa = -((0x0fff + 1) - mantissa);
  }
  let exponent = raw >> 12;
  if (exponent >= 0x0008) {
    exponent = -((0x000f + 1) - exponent);
  }
  return mantissa * Math.pow(10, exponent);
};

/** 解析心率量測資料。*/
export const parseHeartRateMeasurement = (view: DataView): HeartRateMeasurement => {
  const flags = view.getUint8(0);
  const isUint16 = (flags & 0x1) === 0x1;
  const contactDetected = (flags & 0x2) === 0x2;
  const energyPresent = (flags & 0x8) === 0x8;
  const rrPresent = (flags & 0x10) === 0x10;

  let offset = 1;
  const heartRate = isUint16 ? view.getUint16(offset, true) : view.getUint8(offset);
  offset += isUint16 ? 2 : 1;

  let energyExpended: number | null = null;
  if (energyPresent && offset + 2 <= view.byteLength) {
    energyExpended = view.getUint16(offset, true);
    offset += 2;
  }

  const rrIntervals: number[] = [];
  if (rrPresent) {
    while (offset + 1 < view.byteLength) {
      const rr = view.getUint16(offset, true) / 1024; // 轉換為秒
      rrIntervals.push(rr);
      offset += 2;
    }
  }

  return {
    heartRate,
    contactDetected,
    energyExpended,
    rrIntervals: rrIntervals.length ? rrIntervals : undefined,
    raw: view
  };
};

/** 嘗試解析血氧量測資料。*/
export const parsePulseOximeterMeasurement = (view: DataView): PulseOximeterMeasurement => {
  // Flags 佔 16 bits
  if (view.byteLength < 4) {
    return {
      spo2: null,
      heartRate: null,
      raw: view
    };
  }

  const spo2 = parseSfloat(view, 2);
  const heartRate = parseSfloat(view, 4);

  return {
    spo2: Number.isFinite(spo2 ?? NaN) ? spo2 : null,
    heartRate: Number.isFinite(heartRate ?? NaN) ? heartRate : null,
    raw: view
  };
};

/**
 * 取得指定服務與特徵，若不存在則回傳 null。
 */
const getOptionalCharacteristic = async(
  server: BluetoothRemoteGATTServer,
  serviceUuid: BluetoothServiceUUID,
  characteristicUuid: BluetoothCharacteristicUUID
): Promise<BluetoothRemoteGATTCharacteristic | null> => {
  try {
    const service = await server.getPrimaryService(serviceUuid);
    return await service.getCharacteristic(characteristicUuid);
  }
  catch (error) {
    console.warn('[bluetooth] 無法取得特徵', { serviceUuid, characteristicUuid, error });
    return null;
  }
};

/**
 * 启動通知並回傳解除監聽函式。
 */
const startNotifications = async<T>(
  characteristic: BluetoothRemoteGATTCharacteristic,
  parser: (view: DataView) => T,
  callback: (measurement: T) => void
): Promise<BluetoothNotificationStopper> => {
  const handleChange = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic | null;
    const value = target?.value;
    if (!value) {
      return;
    }
    try {
      const parsed = parser(value);
      callback(parsed);
    }
    catch (error) {
      console.error('[bluetooth] 通知資料解析失敗', error);
    }
  };

  await characteristic.startNotifications();
  characteristic.addEventListener('characteristicvaluechanged', handleChange);

  return async() => {
    characteristic.removeEventListener('characteristicvaluechanged', handleChange);
    try {
      await characteristic.stopNotifications();
    }
    catch (error) {
      console.warn('[bluetooth] 停止通知時發生警告', error);
    }
  };
};

// -- 對外函式 -----------------------------------------------------------------------------------------------
/**
 * 透過 Web Bluetooth 搜尋並請使用者選擇健康量測裝置。
 */
export const requestHealthDevice = async(options?: RequestDeviceOptions): Promise<BluetoothDevice> => {
  const bluetooth = ensureBluetooth();
  const requestOptions: EnhancedRequestDeviceOptions = options
    ? { ...options }
    : createDefaultRequestOptions();

  const hasFilters = Array.isArray(requestOptions.filters) && requestOptions.filters.length > 0;

  if (!requestOptions.acceptAllDevices && !hasFilters) {
    // 沒有 filters 會導致例外，預設允許所有裝置並搭配 optional services。
    requestOptions.acceptAllDevices = true;
  }

  return await bluetooth.requestDevice(requestOptions);
};

/**
 * 與指定裝置建立 GATT 連線並嘗試取得心率與血氧特徵。
 */
export const connectHealthDevice = async(device: BluetoothDevice): Promise<BluetoothHealthContext> => {
  if (!device.gatt) {
    throw new Error('選取的裝置不支援 GATT 連線，無法取得資料。');
  }

  const server = await device.gatt.connect();
  const heartRateCharacteristic = await getOptionalCharacteristic(server, HEART_RATE_SERVICE_UUID, HEART_RATE_MEASUREMENT_CHAR_UUID);

  const pulseOximeterCharacteristic = (await getOptionalCharacteristic(server, PULSE_OXIMETER_SERVICE_UUID, PULSE_OXIMETER_CONTINUOUS_CHAR_UUID))
    ?? (await getOptionalCharacteristic(server, PULSE_OXIMETER_SERVICE_UUID, PULSE_OXIMETER_SPOT_CHECK_CHAR_UUID));

  return {
    device,
    server,
    heartRateCharacteristic,
    pulseOximeterCharacteristic
  };
};

/**
 * 啟動心率特徵通知。
 */
export const startHeartRateNotifications = async(
  characteristic: BluetoothRemoteGATTCharacteristic,
  callback: (measurement: HeartRateMeasurement) => void
): Promise<BluetoothNotificationStopper> => startNotifications(characteristic, parseHeartRateMeasurement, callback);

/**
 * 立即讀取一次心率值。
 */
export const readHeartRateOnce = async(
  characteristic: BluetoothRemoteGATTCharacteristic
): Promise<HeartRateMeasurement> => {
  const value = await characteristic.readValue();
  return parseHeartRateMeasurement(value);
};

/**
 * 啟動血氧特徵通知，支援連續與即時量測。
 */
export const startPulseOximeterNotifications = async(
  characteristic: BluetoothRemoteGATTCharacteristic,
  callback: (measurement: PulseOximeterMeasurement) => void
): Promise<BluetoothNotificationStopper> => startNotifications(characteristic, parsePulseOximeterMeasurement, callback);

/**
 * 立即讀取一次血氧值。
 */
export const readPulseOximeterOnce = async(
  characteristic: BluetoothRemoteGATTCharacteristic
): Promise<PulseOximeterMeasurement> => {
  const value = await characteristic.readValue();
  return parsePulseOximeterMeasurement(value);
};

/**
 * 中斷裝置連線。
 */
export const disconnectDevice = async(device: BluetoothDevice | null | undefined): Promise<void> => {
  if (!device?.gatt) {
    return;
  }
  if (device.gatt.connected) {
    device.gatt.disconnect();
  }
};

/** 轉換錯誤訊息為適合顯示的文字。*/
export const normalizeBluetoothError = (error: unknown): string => {
  if (!error) {
    return '未知錯誤';
  }
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotFoundError':
        return '沒有找到符合條件的藍牙裝置。';
      case 'NotSupportedError':
        return '此裝置或瀏覽器不支援所要求的藍牙功能。';
      case 'SecurityError':
        return '藍牙權限被拒絕，請確認已授權使用藍牙。';
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};
