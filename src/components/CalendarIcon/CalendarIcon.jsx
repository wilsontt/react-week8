/**
 * 動態日曆 SVG 組件
 * 根據傳入的日期自動更新月份和日期
 */

export function CalendarIcon({ date }) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  
  return (
    <svg width="40" height="44" viewBox="0 0 40 44" style={{ flexShrink: 0 }}>
      {/* 外框 - 黑色邊框，圓角設計 */}
      <rect x="1" y="1" width="38" height="42" rx="4" 
            fill="none" stroke="black" strokeWidth="2"/>
      
      {/* 上半部 - 淺藍色背景，顯示月份 */}
      <rect x="2" y="2" width="36" height="18" rx="3" fill="#87CEEB"/>
      <text x="20" y="15" textAnchor="middle" 
            fill="black" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
        {month}
      </text>
      
      {/* 下半部 - 淺黃色/奶油色背景，顯示日期 */}
      <rect x="2" y="20" width="36" height="22" rx="3" fill="#FFFDD0"/>
      <text x="20" y="38" textAnchor="middle" 
            fill="black" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
        {day}
      </text>
    </svg>
  );
}
