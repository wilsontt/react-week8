# CalendarIcon SVG 日期時間顯示 元件模組

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-stable-green.svg)

## 概述

本模組提供可重複使用的日期時間顯示功能，包含：

- **`useCurrentTime` Hook**：提供自動更新的當前時間
- **`DateTimeDisplay` 元件**：完整的日期時間顯示元件
- **`CalendarIcon` 元件**：日曆圖標 SVG 元件

## 功能特色

- ✅ 自動更新時間（可自訂更新頻率）
- ✅ 支援自訂日期時間格式（使用 date-fns）
- ✅ 支援顯示/隱藏星期
- ✅ 支援顯示/隱藏日曆圖標
- ✅ 支援單行/兩行顯示模式
- ✅ 可自訂樣式和對齊方式
- ✅ 使用 Bootstrap 5 進行樣式設定
- ✅ 零依賴（除了 date-fns 和 React）

## 安裝需求

本模組需要以下依賴：

```json
{
  "react": "^18.0.0",
  "date-fns": "^3.0.0",
  "bootstrap": "^5.3.8"
}
```

## 快速開始

### 基本使用

```jsx
import { DateTimeDisplay } from './components/CalendarIcon';

function MyComponent() {
  return <DateTimeDisplay />;
}
```

### 帶日曆圖標

```jsx
import { DateTimeDisplay } from './components/CalendarIcon';

function MyComponent() {
  return <DateTimeDisplay showCalendarIcon />;
}
```

### 僅使用 Hook

```jsx
import { useCurrentTime } from './components/CalendarIcon';
import { format } from 'date-fns';

function MyComponent() {
  const currentTime = useCurrentTime({ interval: 1000 });
  
  return <div>{format(currentTime, 'yyyy-MM-dd HH:mm:ss')}</div>;
}
```

## API 文件

### `useCurrentTime` Hook

提供當前時間的 React Hook，可自動更新。

#### 參數

```javascript
/**
 * @param {Object} options - 配置選項
 * @param {number} [options.interval=1000] - 更新間隔（毫秒），預設 1000ms
 * @param {boolean} [options.immediate=true] - 是否立即更新，預設 true
 * @returns {Date} 當前時間的 Date 物件
 */
```

#### 回傳值

- `Date`：當前時間的 Date 物件

#### 範例

```jsx
// 每秒更新
const time = useCurrentTime({ interval: 1000 });

// 每分鐘更新
const time = useCurrentTime({ interval: 60000 });

// 延遲更新（不立即更新）
const time = useCurrentTime({ interval: 1000, immediate: false });
```

---

### `DateTimeDisplay` 元件

完整的日期時間顯示元件，自動更新當前時間。

#### Props

| 屬性 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `dateFormat` | `string` | `"yyyy年MM月dd日"` | 日期格式（date-fns format string） |
| `timeFormat` | `string` | `"HH:mm:ss"` | 時間格式（date-fns format string） |
| `showWeekday` | `boolean` | `true` | 是否顯示星期 |
| `showCalendarIcon` | `boolean` | `false` | 是否顯示日曆圖標 |
| `updateInterval` | `number` | `1000` | 更新間隔（毫秒） |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'right'` | 文字對齊方式 |
| `className` | `string` | - | 自訂 className（Bootstrap 類別） |
| `dateClassName` | `string` | - | 日期文字的自訂 className |
| `timeClassName` | `string` | - | 時間文字的自訂 className |
| `singleLine` | `boolean` | `false` | 是否顯示為單行 |
| `separator` | `string` | `" "` | 單行時的分隔符號 |

#### 範例

```jsx
// 基本使用
<DateTimeDisplay />

// 帶日曆圖標
<DateTimeDisplay showCalendarIcon />

// 自訂格式
<DateTimeDisplay
  dateFormat="yyyy/MM/dd"
  timeFormat="HH:mm"
  showWeekday={false}
/>

// 單行顯示
<DateTimeDisplay
  singleLine
  separator=" | "
  showCalendarIcon
/>

// 自訂樣式（使用 Bootstrap 類別）
<DateTimeDisplay
  textAlign="center"
  className="bg-light p-3 rounded border"
  dateClassName="fs-5 fw-bold text-primary"
  timeClassName="small text-secondary"
/>
```

## 使用範例

詳細的使用範例請參考 [`Examples.jsx`](./Examples.jsx) 檔案，包含：

1. 基本使用
2. 帶日曆圖標
3. 自訂日期時間格式
4. 單行顯示
5. 自訂樣式和對齊方式
6. 調整更新頻率
7. 僅使用 Hook
8. 多個實例
9. 在卡片中使用
10. 響應式設計

## 日期時間格式參考

本模組使用 [date-fns](https://date-fns.org/) 進行日期時間格式化。

### 常用格式字串

| 格式 | 說明 | 範例輸出 |
|------|------|----------|
| `yyyy` | 四位數年份 | 2026 |
| `MM` | 兩位數月份 | 01, 12 |
| `dd` | 兩位數日期 | 01, 31 |
| `HH` | 24小時制小時 | 00, 23 |
| `mm` | 分鐘 | 00, 59 |
| `ss` | 秒數 | 00, 59 |

### 完整格式範例

```jsx
// 中文格式
dateFormat="yyyy年MM月dd日"  // 2026年01月07日
timeFormat="HH:mm:ss"        // 20:30:45

// 國際格式
dateFormat="yyyy/MM/dd"      // 2026/01/07
timeFormat="HH:mm"           // 20:30

// ISO 格式
dateFormat="yyyy-MM-dd"       // 2026-01-07
timeFormat="HH:mm:ss"         // 20:30:45
```

更多格式選項請參考 [date-fns 文件](https://date-fns.org/docs/format)。

## 在其他專案中使用

### 複製檔案

將以下檔案複製到您的專案：

```
src/components/CalendarIcon/
├── useCurrentTime.js
├── DateTimeDisplay.jsx
├── CalendarIcon.jsx
├── index.js
└── README.md
```

### 調整匯入路徑

根據您的專案結構調整匯入路徑：

```jsx
// 如果放在不同位置
import { DateTimeDisplay } from '@/components/DateTimeDisplay';
import { useCurrentTime } from '@/hooks/useCurrentTime';
```

### 確保依賴已安裝

```bash
npm install date-fns bootstrap
# 或
yarn add date-fns bootstrap
```

### 確保 CalendarIcon 可用

如果您的專案中沒有 `CalendarIcon` 元件，需要：

1. 複製 `src/components/CalendarIcon/CalendarIcon.jsx` 到您的專案
2. 或修改 `DateTimeDisplay.jsx` 中的匯入路徑
3. 或設定 `showCalendarIcon={false}` 不使用圖標

## 注意事項

1. **效能考量**：預設每秒更新一次，如果有多個實例，請考慮調整更新頻率
2. **時區**：時間顯示基於使用者瀏覽器的本地時區
3. **格式字串**：請確保使用正確的 date-fns 格式字串
4. **樣式依賴**：本元件使用 Bootstrap 5 類別，請確保專案已安裝並引入 Bootstrap CSS

## 授權

本模組為專案內部使用，可自由複製到其他專案。

## 更新日誌

### v1.0.0 (2026-01-18)

- 初始版本
- 實作 `useCurrentTime` Hook
- 實作 `DateTimeDisplay` 元件
- 使用 Bootstrap 5 進行樣式設定
- 提供完整的使用範例和文件
