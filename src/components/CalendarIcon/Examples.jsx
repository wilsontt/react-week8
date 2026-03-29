/**
 * DateTimeDisplay 使用範例
 * 
 * 本檔案展示各種使用 DateTimeDisplay 元件的方式
 * 這些範例可以直接複製到您的專案中使用
 * 
 * @module Examples
 */

import { DateTimeDisplay, useCurrentTime } from './index';
import { format } from 'date-fns';

/**
 * 範例 1: 基本使用（僅文字，兩行顯示）
 * 
 * 最簡單的使用方式，顯示日期和時間（含星期）
 */
export function Example1_Basic() {
  return <DateTimeDisplay />;
}

/**
 * 範例 2: 帶日曆圖標
 * 
 * 顯示日期時間文字，並在右側顯示日曆圖標
 * 適合用在導覽列或頁首
 */
export function Example2_WithCalendarIcon() {
  return <DateTimeDisplay showCalendarIcon />;
}

/**
 * 範例 3: 自訂日期時間格式
 * 
 * 使用 date-fns 格式字串自訂顯示格式
 * 不顯示星期
 */
export function Example3_CustomFormat() {
  return (
    <DateTimeDisplay
      dateFormat="yyyy/MM/dd"
      timeFormat="HH:mm"
      showWeekday={false}
    />
  );
}

/**
 * 範例 4: 單行顯示
 * 
 * 將日期、時間和星期顯示在同一行
 * 可自訂分隔符號
 */
export function Example4_SingleLine() {
  return (
    <DateTimeDisplay
      singleLine
      separator=" | "
      showCalendarIcon
    />
  );
}

/**
 * 範例 5: 自訂樣式和對齊方式
 * 
 * 使用 className 自訂樣式
 * 調整文字對齊方式
 */
export function Example5_CustomStyle() {
  return (
    <DateTimeDisplay
      textAlign="center"
      className="bg-light p-3 rounded border"
      dateClassName="fs-5 fw-bold text-primary"
      timeClassName="small text-secondary"
      showCalendarIcon
    />
  );
}

/**
 * 範例 6: 調整更新頻率
 * 
 * 預設每秒更新，可調整為每分鐘更新
 * 適合不需要即時秒數的場景
 */
export function Example6_CustomInterval() {
  return (
    <DateTimeDisplay
      updateInterval={60000} // 每分鐘更新
      timeFormat="HH:mm" // 不顯示秒數
      showCalendarIcon
    />
  );
}

/**
 * 範例 7: 僅使用 Hook
 * 
 * 如果只需要時間資料，不需要顯示元件
 * 可以直接使用 useCurrentTime Hook
 */
export function Example7_UseHookOnly() {
  const currentTime = useCurrentTime({ interval: 1000 });

  return (
    <div>
      <p>當前時間: {format(currentTime, 'yyyy-MM-dd HH:mm:ss')}</p>
      <p>時間戳: {currentTime.getTime()}</p>
    </div>
  );
}

/**
 * 範例 8: 多個實例
 * 
 * 可以在同一個頁面中使用多個 DateTimeDisplay 實例
 * 每個實例獨立更新
 */
export function Example8_MultipleInstances() {
  return (
    <div>
      <div className="mb-3">
        <h3>標準格式</h3>
        <DateTimeDisplay />
      </div>
      <div className="mb-3">
        <h3>簡短格式</h3>
        <DateTimeDisplay
          dateFormat="MM/dd"
          timeFormat="HH:mm"
          showWeekday={false}
        />
      </div>
      <div className="mb-3">
        <h3>完整格式（含圖標）</h3>
        <DateTimeDisplay showCalendarIcon />
      </div>
    </div>
  );
}

/**
 * 範例 9: 在卡片中使用
 * 
 * 將日期時間顯示元件嵌入到卡片或其他容器中
 */
export function Example9_InCard() {
  return (
    <div className="card p-3 shadow-sm">
      <h2 className="h5 fw-bold mb-3">系統資訊</h2>
      <div className="d-flex justify-content-between align-items-center">
        <span>當前時間：</span>
        <DateTimeDisplay
          singleLine
          separator=" "
          className="font-monospace"
        />
      </div>
    </div>
  );
}

/**
 * 範例 10: 響應式設計
 * 
 * 在不同螢幕尺寸下使用不同的顯示方式
 */
export function Example10_Responsive() {
  return (
    <div>
      {/* 桌面版：完整顯示 */}
      <div className="d-none d-md-block">
        <DateTimeDisplay showCalendarIcon />
      </div>
      {/* 行動版：單行簡化顯示 */}
      <div className="d-block d-md-none">
        <DateTimeDisplay
          singleLine
          dateFormat="MM/dd"
          timeFormat="HH:mm"
          showWeekday={false}
        />
      </div>
    </div>
  );
}
