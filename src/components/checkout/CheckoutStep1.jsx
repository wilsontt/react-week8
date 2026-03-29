/**
 * 結帳步驟 1：清單確認
 * 顯示購物車摘要，確認後進入下一步
 */
import { useDispatch, useSelector } from "react-redux";
import { setStep } from "../../slices/checkoutSlice";
import {
  selectCarts,
  selectTotalAmount,
  selectAppliedCoupon,
  selectCouponDiscountAmount,
  selectTotalAfterCoupon,
} from "../../slices/cartSlice";
import MoneyAmount from "../common/MoneyAmount";

const getProduct = (item) => item?.product ?? item;

export default function CheckoutStep1() {
  const dispatch = useDispatch();
  const carts = useSelector(selectCarts);
  const totalAmount = useSelector(selectTotalAmount);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const couponDiscount = useSelector(selectCouponDiscountAmount);
  const totalAfterCoupon = useSelector(selectTotalAfterCoupon);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="border-start border-3 border-success ps-2 mb-3">確認購物車內容</h5>
        <p className="text-muted small mb-3">請確認上方購物車內容無誤後，點擊下一步填寫收件資料。</p>
        <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
          <span>商品小計</span>
          <MoneyAmount value={totalAmount} />
        </div>
        {appliedCoupon && couponDiscount > 0 ? (
          <div className="d-flex justify-content-between align-items-center small text-success mb-1">
            <span>優惠折抵（{appliedCoupon.code}）</span>
            <span className="d-inline-flex align-items-center gap-1">
              <span aria-hidden>-</span>
              <MoneyAmount value={couponDiscount} />
            </span>
          </div>
        ) : null}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <span className="text-muted">共 {carts.length} 項商品</span>
          <span className="fw-bold text-success d-inline-flex align-items-baseline gap-1 flex-wrap">
            <span>總計：</span>
            <MoneyAmount value={totalAfterCoupon} total className="text-success" />
          </span>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-success" onClick={() => dispatch(setStep(2))}>
            下一步：填寫資料
          </button>
        </div>
      </div>
    </div>
  );
}
