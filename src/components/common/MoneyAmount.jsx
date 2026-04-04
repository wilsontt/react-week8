import "./price-cell.css";

/**
 * 金額顯示：NT$ + 千分位（與客戶購物車 `Cart.jsx` 相同結構與 RWD）
 *
 * @param {number|string} value - 金額；非有限數字顯示「—」
 * @param {string} [className] - 附加於外層 `cart-page__price-cell`
 * @param {boolean} [total=false] - 為 true 時套用 `cart-page__price-cell--total`（加總列字重）
 */
export default function MoneyAmount({ value, className = "", total = false }) {
  const n = typeof value === "number" ? value : Number(value);
  const str = Number.isFinite(n) ? Math.round(n).toLocaleString() : "—";
  const rootClass = [
    "cart-page__price-cell",
    total ? "cart-page__price-cell--total" : "",
    className.trim(),
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={rootClass}>
      <span className="cart-page__currency">NT$</span>
      <span className="cart-page__amount">{str}</span>
    </span>
  );
}
