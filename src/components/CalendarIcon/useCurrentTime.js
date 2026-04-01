/**
 * useCurrentTime Hook
 * 
 * 提供當前時間的 React Hook，可自動更新
 * 
 * @module useCurrentTime
 */

import { useState, useEffect } from 'react';

/**
 * 提供當前時間的 Hook
 * 
 * @param {Object} options - 配置選項
 * @param {number} [options.interval=1000] - 更新間隔（毫秒），預設 1000ms
 * @param {boolean} [options.immediate=true] - 是否立即更新，預設 true
 * @returns {Date} 當前時間的 Date 物件
 * 
 * @example
 * ```jsx
 * import { useCurrentTime } from './useCurrentTime';
 * 
 * function MyComponent() {
 *   const currentTime = useCurrentTime({ interval: 1000 });
 *   return <div>{currentTime.toLocaleString()}</div>;
 * }
 * ```
 */
export function useCurrentTime(options = {}) {
  const { interval = 1000, immediate = true } = options;
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    // 不在 effect 開頭同步 setState（eslint react-hooks/set-state-in-effect）；
    // 首次顯示時間由 useState 惰性初值負責；週期更新僅由 setInterval 觸發。
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, interval);

    return () => clearInterval(timer);
  }, [interval, immediate]);

  return currentTime;
}
