/**
 * DateTimeDisplay 元件
 * 
 * 可重複使用的日期時間顯示元件
 * 自動更新當前時間，支援自訂格式和樣式
 * 
 * @module DateTimeDisplay
 */

import { format } from 'date-fns';
import { useCurrentTime } from './useCurrentTime';
import { CalendarIcon } from './CalendarIcon';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 日期時間顯示元件
 * 
 * 自動更新當前時間，可自訂格式和樣式
 * 
 * @param {Object} props - 元件屬性
 * @param {string} [props.dateFormat='yyyy年MM月dd日'] - 日期格式（date-fns format string）
 * @param {string} [props.timeFormat='HH:mm:ss'] - 時間格式（date-fns format string）
 * @param {boolean} [props.showWeekday=true] - 是否顯示星期，預設 true
 * @param {boolean} [props.showCalendarIcon=false] - 是否顯示日曆圖標，預設 false
 * @param {number} [props.updateInterval=1000] - 更新間隔（毫秒），預設 1000ms
 * @param {string} [props.textAlign='right'] - 文字對齊方式，預設 "right"
 * @param {string} [props.className] - 自訂 className
 * @param {string} [props.dateClassName] - 日期文字的自訂 className
 * @param {string} [props.timeClassName] - 時間文字的自訂 className
 * @param {boolean} [props.singleLine=false] - 是否顯示為單行，預設 false（兩行顯示）
 * @param {string} [props.separator=' '] - 單行時的分隔符號，預設 " "
 * @returns {JSX.Element} JSX 元素
 * 
 * @example
 * ```jsx
 * import { DateTimeDisplay } from './components/CalendarIcon';
 * 
 * // 基本使用
 * <DateTimeDisplay />
 * 
 * // 帶日曆圖標
 * <DateTimeDisplay showCalendarIcon />
 * 
 * // 自訂格式
 * <DateTimeDisplay
 *   dateFormat="yyyy/MM/dd"
 *   timeFormat="HH:mm"
 *   showWeekday={false}
 * />
 * ```
 */
export function DateTimeDisplay({
  dateFormat = 'yyyy年MM月dd日',
  timeFormat = 'HH:mm:ss',
  showWeekday = true,
  showCalendarIcon = false,
  updateInterval = 1000,
  textAlign = 'right',
  className,
  dateClassName,
  timeClassName,
  singleLine = false,
  separator = ' ',
}) {
  const currentTime = useCurrentTime({ interval: updateInterval });

  const formattedDate = format(currentTime, dateFormat);
  const formattedTime = format(currentTime, timeFormat);
  const weekday = showWeekday ? `星期${WEEKDAYS[currentTime.getDay()]}` : '';

  const textAlignClass = {
    left: 'text-start',
    center: 'text-center',
    right: 'text-end',
  }[textAlign];

  if (singleLine) {
    return (
      <div className={`d-flex align-items-center ${className || ''}`} style={{ gap: '0.5rem' }}>
        <div className={`small text-muted ${textAlignClass} ${className || ''}`}>
          {formattedDate}
          {separator}
          {formattedTime}
          {weekday && `${separator}${weekday}`}
        </div>
        {showCalendarIcon && <CalendarIcon date={currentTime} />}
      </div>
    );
  }

  return (
    <div className={`d-flex align-items-center ${className || ''}`} style={{ gap: '1rem' }}>
      <div className={`small text-muted ${textAlignClass}`}>
        <div className={dateClassName}>{formattedDate}</div>
        <div className={timeClassName}>
          {formattedTime}
          {weekday && ` ${weekday}`}
        </div>
      </div>
      {showCalendarIcon && <CalendarIcon date={currentTime} />}
    </div>
  );
}
