/**
 * 通知 Toast 元件（全站與 `showNotification` 搭配）
 *
 * - 位置：fixed 右上方（`top: 120px` 避開 Navbar 日期區）
 * - 成功：標題列綠底；錯誤：標題列紅底
 * - 購物車優惠券、加入購物車等皆應使用本元件，避免 `alert`
 */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTimes } from "react-icons/fa";
import { selectNotification, hideNotification } from "../../slices/notificationSlice";

/** 顯示秒數：與需求一致固定 5 秒；修改時請同步 README 說明 */
const AUTO_HIDE_MS = 5000;

export default function NotificationToast() {
  const dispatch = useDispatch();
  const { visible, type, message } = useSelector(selectNotification);

  /**
   * 可見時啟動倒數關閉。
   * 依賴 `message`：連續觸發不同訊息時會重置計時，避免前一則的 timeout 提早關掉後一則。
   */
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dispatch(hideNotification()), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible, message, dispatch]);

  if (!visible) return null;

  const headerBg = type === "success" ? "bg-success" : "bg-danger";
  const title = type === "success" ? "成功" : "錯誤";

  return (
    <div
      className="position-fixed rounded shadow-sm border overflow-hidden"
      style={{
        top: "120px",
        right: "1rem",
        zIndex: 1100,
        minWidth: "280px",
        maxWidth: "360px",
      }}
      role="alert"
    >
      <div className={`d-flex align-items-center justify-content-between px-3 py-2 text-white ${headerBg}`}>
        <span className="fw-bold">{title}</span>
        <button
          type="button"
          className="btn btn-link p-0 text-white text-decoration-none"
          aria-label="關閉"
          onClick={() => dispatch(hideNotification())}
        >
          <FaTimes size={18} />
        </button>
      </div>
      <div className="bg-white px-3 py-2 text-dark">{message}</div>
    </div>
  );
}
