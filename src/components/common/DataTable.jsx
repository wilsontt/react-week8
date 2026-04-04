import "./data-table.css";

/**
 * 後台表格「操作／編輯」欄專用：圓形外框＋圖示（對齊客戶購物車操作欄樣式）
 *
 * @param {Object} props
 * @param {'dark'|'danger'|'primary'|'secondary'|'success'|'warning'|'info'} [props.variant='dark'] - `btn-outline-*` 色系
 * @param {import('react').ReactNode} props.children - 通常為 react-icons
 * @param {() => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} props.ariaLabel - 無文字按鈕時必填，供無障礙
 * @param {string} [props.title] - 滑鼠提示（可選）
 */
export function DataTableIconButton({
  variant = "dark",
  children,
  onClick,
  disabled = false,
  ariaLabel,
  title,
}) {
  return (
    <button
      type="button"
      className={`btn btn-outline-${variant} btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center data-table__icon-action-btn`}
      style={{ width: 36, height: 36 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

/**
 * 共用資料表元件 (DataTable)
 * 支援自訂欄位、載入中狀態、空資料狀態、隔列底色（偶數列 highlight）
 *
 * 操作欄建議使用 {@link DataTableIconButton} 與購物車列一致之圓形圖示按鈕。
 *
 * Props:
 * - columns: 欄位設定陣列 { key, label, thClassName, tdClassName, style, render(item, index) }
 * - data: 資料陣列
 * - loading: 是否載入中
 * - emptyState: 空資料時顯示的內容 (ReactNode)
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyState = null,
}) {
  return (
    <div className="table-responsive data-table" role="region" aria-label="資料表格（可左右捲動）">
      <table className="table table-hover align-middle mb-0 data-table--striped-even data-table__table">
        <thead className="table-light">
          <tr style={{ borderBottom: "1px dashed #dee2e6" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`border-0 bg-light py-3 ${col.thClassName || ""}`}
                style={col.style || {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5 text-muted border-0">
                載入中...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5 border-0">
                {emptyState || <div className="text-muted">目前沒有資料</div>}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: "1px dashed #dee2e6" }}>
                {columns.map((col) => (
                  <td key={col.key} className={`border-0 py-3 ${col.tdClassName || ""}`}>
                    {col.render ? col.render(item, index) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
