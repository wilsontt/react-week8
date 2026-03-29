/**
 * 結帳流程 Stepper（四步驟進度條）
 *
 * 視覺規格（樣式於 `CheckoutStepper.css`）：
 * - `step.num <= currentStep`：藍底白字圓圈（Bootstrap primary `#0d6efd`）、下方標籤加粗深色
 * - 尚未走到：灰框白底圓圈、灰字標籤
 * - 兩步驟之間連接線：`line--done` 表示「已通過該段」（藍），否則淺灰
 *
 * 對應 `checkoutSlice.step`：1 清單確認 → 2 資料填寫 → 3 付款確認 → 4 完成訂單
 */
import "./CheckoutStepper.css";

/** 步驟定義：順序與後端無關，僅 UI 與 Redux step 同步 */
const STEPS = [
  { num: 1, label: "清單確認" },
  { num: 2, label: "資料填寫" },
  { num: 3, label: "付款確認" },
  { num: 4, label: "完成訂單" },
];

/**
 * @param {Object} props
 * @param {number} props.currentStep - Redux checkout.step（1～4）
 */
export default function CheckoutStepper({ currentStep }) {
  return (
    <div className="checkout-stepper" role="navigation" aria-label="結帳步驟">
      {STEPS.map((step, idx) => {
        // 此步是否已達成或為當前步（含已完成步驟高亮）
        const isActive = step.num <= currentStep;
        return (
          <div key={step.num} className="checkout-stepper__segment">
            <div className="checkout-stepper__step">
              <div
                className={`checkout-stepper__circle ${isActive ? "checkout-stepper__circle--active" : ""}`}
                aria-current={step.num === currentStep ? "step" : undefined}
              >
                {step.num}
              </div>
              <span
                className={`checkout-stepper__label ${isActive ? "checkout-stepper__label--active" : ""}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 ? (
              // 線在「本步與下一步之間」：`line--done` = 流程已超過本步（currentStep > step.num）
              <div
                className={`checkout-stepper__line ${step.num < currentStep ? "checkout-stepper__line--done" : ""}`}
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
