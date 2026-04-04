import logo from '../../assets/花草的世界_logo.png';

/**
 * 頁面背景：淡色 logo 作為底圖，內容疊在上方
 * @param {boolean} alignTop - true 時內容置頂、不留空白；預設 false 為垂直置中
 */
export default function PageWithLogoBg({ children, className = '', alignTop = false }) {
  return (
    <div
      className={`position-relative w-100 ${className}`}
      style={{ minHeight: alignTop ? 'auto' : '80vh' }}
    >
      {/* 淡色 logo 背景，不擋住點擊 */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url(${logo})`,  // 背景圖案, url（圖片路徑）、linear-gradient（漸層）、radial-gradient（放射狀漸層）、conic-gradient（圓錐狀漸層）.
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',  // 背景圖案是否重複, repeat（重複）、no-repeat（不重複）、repeat-x（水平重複）、repeat-y（垂直重複）.
          backgroundPosition: 'center',  // 背景圖案位置, center（中央）、top（上方）、bottom（下方）、left（左方）、right（右方）、top left（左上）、top right（右上）、bottom left（左下）、bottom right（右下）.
          opacity: 0.10,  // 背景圖案透明度, 0.06 ~ 0.12（愈小愈淡）.
          pointerEvents: 'none',  // 背景圖案是否可點擊, none（不可點擊）、auto（可點擊）.
        }}
      />
      {/* 內容疊在上方；alignTop 時置頂無空白，否則垂直置中 */}
      <div
        className={`position-relative w-100 d-flex flex-column align-items-center ${alignTop ? 'justify-content-start' : 'justify-content-center'}`}
        style={{ minHeight: alignTop ? 'auto' : '80vh', padding: alignTop ? '0' : '2rem 0' }}
      >
        {children}
      </div>
    </div>
  );
}
