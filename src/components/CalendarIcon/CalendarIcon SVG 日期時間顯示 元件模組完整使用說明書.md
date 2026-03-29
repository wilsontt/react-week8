# CalendarIcon SVG 日期時間顯示 元件模組完整使用說明書

本說明書旨在協助您將「CalendarIcon SVG 日期時間顯示元件」完整遷移並整合至您的 React 專案中。

---

## 1. 檔案清單與複製步驟

請將原始目錄中的以下 **5 個核心檔案** 複製到您專案的 `src/components/CalendarIcon/` 路徑下：

- **`CalendarIcon.jsx`**：核心 SVG 圖標繪製元件。
- **`DateTimeDisplay.jsx`**：主要的顯示元件（組合了圖標與時間文字）。
- **`useCurrentTime.js`**：負責時間自動更新邏輯的自訂 Hook。
- **`index.js`**：模組導出入口檔案。
- **`README.md`**：元件原始開發文件。

> **注意**：`Examples.jsx` 為範例檔案，不需要複製到生產環境中，僅供參考用法。

---

## 2. 安裝必要依賴

本元件依賴以下套件，請在專案根目錄執行：

```bash
# 使用 npm
npm install date-fns bootstrap

# 或使用 yarn
yarn add date-fns bootstrap
```

---

## 3. 路徑調整 (必做)

複製檔案後，為了確保內部引用正確，請檢查並修改以下檔案的匯入路徑：

### (1) 修改 `DateTimeDisplay.jsx`
檢查檔案開頭的匯入路徑：
```jsx
// 確保匯入路徑正確
import { CalendarIcon } from './CalendarIcon'; 
import { useCurrentTime } from './useCurrentTime';
```

### (2) 修改 `index.js`
確保導出路徑正確：
```jsx
export { useCurrentTime } from './useCurrentTime';
export { DateTimeDisplay } from './DateTimeDisplay';
export { CalendarIcon } from './CalendarIcon';
```

---

## 4. 樣式系統配置 (Bootstrap 5)

本元件使用 **Bootstrap 5** 進行排版與配色。

### 如果您的專案尚未安裝 Bootstrap 5：
請參考以下步驟快速安裝：

1. **安裝套件**：
   ```bash
   npm install bootstrap
   # 或
   yarn add bootstrap
   ```

2. **引入 CSS 和 JS**：在您的主入口檔案（如 `main.jsx`）中加入：
   ```jsx
   import 'bootstrap/dist/css/bootstrap.min.css';
   import 'bootstrap/dist/js/bootstrap.bundle.min.js';
   ```

3. **使用 Bootstrap 類別**：元件已使用 Bootstrap 類別，如：
   - `d-flex`：flexbox 布局
   - `align-items-center`：垂直置中
   - `text-start/center/end`：文字對齊
   - `small`：小字體
   - `text-muted`：灰色文字

---

## 5. 樣式自訂

如果您的專案**不使用** Bootstrap，可以透過以下方式調整：

### 使用內聯樣式
元件已使用內聯樣式處理間距（`gap`），如需調整其他樣式，可以：

1. **透過 `className` prop**：傳入自訂的 CSS 類別
2. **修改元件原始碼**：直接修改 `DateTimeDisplay.jsx` 中的樣式

**範例修改 (DateTimeDisplay.jsx 中的回傳部分)：**
```jsx
// 使用 Bootstrap 類別（預設）
<div className="d-flex align-items-center" style={{ gap: '1rem' }}> ... </div>

// 或使用純內聯樣式
<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}> ... </div>
```

---

## 6. 元件使用方法

在您的 React 頁面中引入並使用：

### 基本使用
```jsx
import { DateTimeDisplay } from './components/CalendarIcon';

function Header() {
  return (
    <div className="header-container">
      {/* 顯示為預設的兩行模式，靠右對齊 */}
      <DateTimeDisplay showCalendarIcon textAlign="right" />
    </div>
  );
}
```

### 單行簡潔模式 (適合導航欄)
```jsx
<DateTimeDisplay 
  singleLine 
  showCalendarIcon 
  separator=" | " 
  className="text-primary" 
/>
```

---

## 7. 參數說明 (Props Reference)

| 屬性 | 型別 | 說明 |
| :--- | :--- | :--- |
| `dateFormat` | `string` | 日期格式 (預設: `yyyy年MM月dd日`) |
| `timeFormat` | `string` | 時間格式 (預設: `HH:mm:ss`) |
| `showWeekday` | `boolean` | 是否顯示星期 |
| `showCalendarIcon` | `boolean` | 是否顯示 SVG 日曆圖標 |
| `singleLine` | `boolean` | 是否強制單行顯示 |
| `textAlign` | `'left'\|'center'\|'right'` | 文字對齊方式 |
| `className` | `string` | 自訂 className（Bootstrap 類別） |
| `dateClassName` | `string` | 日期文字的自訂 className |
| `timeClassName` | `string` | 時間文字的自訂 className |
| `updateInterval` | `number` | 更新間隔（毫秒），預設 1000 |
| `separator` | `string` | 單行時的分隔符號，預設 " " |

---

## 8. 常見問題 (FAQ)

**Q: 為什麼圖標上面的日期沒有更新？**
A: 該元件透過 `useCurrentTime` Hook 每秒驅動重新渲染。請確保 `CalendarIcon` 元件接收到的 `date` 是來自於 `DateTimeDisplay` 內部的 `currentTime` 狀態。

**Q: 如何修改圖標的顏色？**
A: 請直接進入 `CalendarIcon.jsx` 修改 `fill` 屬性的色碼（如 `#87CEEB` 為月份背景色）。

**Q: 如何自訂樣式？**
A: 可以透過 `className`、`dateClassName`、`timeClassName` props 傳入 Bootstrap 類別，或修改元件原始碼使用內聯樣式。

---

**說明書版本：1.0.0**
**更新日期：2026-01-18**
