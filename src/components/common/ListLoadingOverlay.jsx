/**
 * 列表／區塊載入遮罩（Bootstrap spinner）
 * 父元素請加 `position-relative`，必要時 `overflow-hidden`、`border-radius` 以利裁切。
 *
 * @param {object} props
 * @param {boolean} props.show - 是否顯示
 * @param {string} [props.message] - 顯示文字
 */
import "./list-loading-overlay.css";

export default function ListLoadingOverlay({ show, message = "載入中…" }) {
  if (!show) return null;
  return (
    <div className="list-loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="list-loading-overlay__box">
        <div className="spinner-border text-success" aria-hidden="true" />
        <span className="list-loading-overlay__text">{message}</span>
      </div>
    </div>
  );
}
