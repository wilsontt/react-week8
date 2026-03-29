/**
 * 結帳步驟 3：付款確認
 * 顯示訂單資訊、購買人資料、選擇付款方式、馬上付款
 */
import { useDispatch, useSelector } from "react-redux";
import MoneyAmount from "../common/MoneyAmount";
import { payOrderThunk, setStep, setPaymentMethod } from "../../slices/checkoutSlice";
import {
  selectCarts,
  selectTotalAmount,
  selectAppliedCoupon,
  selectCouponDiscountAmount,
  selectTotalAfterCoupon,
} from "../../slices/cartSlice";
import { showNotification } from "../../slices/notificationSlice";

const getProduct = (item) => item?.product ?? item;
const PAYMENT_OPTIONS = [
  { id: "credit", label: "信用卡" },
  { id: "applepay", label: "Apple Pay" },
  { id: "linepay", label: "LINE Pay" },
  { id: "transfer", label: "銀行轉帳" },
];

export default function CheckoutPayment() {
  const dispatch = useDispatch();
  const carts = useSelector(selectCarts);
  const totalAmount = useSelector(selectTotalAmount);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const couponDiscount = useSelector(selectCouponDiscountAmount);
  const totalAfterCoupon = useSelector(selectTotalAfterCoupon);
  const { formData, orderInfo, paymentMethod, loading, error } = useSelector((s) => s.checkout);

  const orderId = orderInfo?.id ?? orderInfo?.orderId ?? "";
  const createdAt = orderInfo?.createdAt
    ? new Date(orderInfo.createdAt * 1000).toLocaleDateString("zh-TW")
    : new Date().toLocaleDateString("zh-TW");

  const handlePay = async () => {
    if (!paymentMethod) {
      dispatch(showNotification({ type: "error", message: "請選擇付款方式" }));
      return;
    }
    try {
      await dispatch(payOrderThunk(orderId)).unwrap();
      dispatch(showNotification({ type: "success", message: "付款成功" }));
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.message ?? "付款失敗" }));
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <h5 className="border-start border-3 border-success ps-2 mb-3">訂單資訊</h5>
            <div className="row small">
              <div className="col-4 text-end text-muted">訂購時間</div>
              <div className="col-8">{createdAt}</div>
              <div className="col-4 text-end text-muted">訂單編號</div>
              <div className="col-8 font-monospace">{orderId || "—"}</div>
              <div className="col-4 text-end text-muted">付款狀態</div>
              <div className="col-8 text-danger">未付款</div>
            </div>
          </div>
        </div>
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <h5 className="border-start border-3 border-success ps-2 mb-3">購買人資料</h5>
            <div className="row small">
              <div className="col-4 text-end text-muted">姓名</div>
              <div className="col-8">{formData.name}</div>
              <div className="col-4 text-end text-muted">地址</div>
              <div className="col-8">{formData.address}</div>
              <div className="col-4 text-end text-muted">電話</div>
              <div className="col-8">{formData.tel}</div>
              <div className="col-4 text-end text-muted">Email</div>
              <div className="col-8">{formData.email}</div>
              <div className="col-4 text-end text-muted">留言</div>
              <div className="col-8">{formData.message || "無"}</div>
            </div>
          </div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">選擇付款方式 <span className="text-danger">*必填</span></h5>
            <div className="d-flex flex-wrap gap-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`d-flex align-items-center p-3 border rounded ${
                    paymentMethod === opt.id ? "border-primary border-2 bg-light" : ""
                  }`}
                  style={{ cursor: "pointer", minWidth: 120 }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => dispatch(setPaymentMethod(opt.id))}
                    className="me-2 border border-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => dispatch(setStep(2))}
              >
                返回上一步
              </button>
              <button
                type="button"
                className="btn btn-primary flex-grow-1"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? "處理中…" : "馬上付款"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card border shadow-sm">
          <div className="card-body">
            <h5 className="text-success text-center mb-3">訂單明細</h5>
            {carts.map((item) => {
              const product = getProduct(item);
              const price = Number(product?.price ?? 0);
              const qty = item?.qty ?? 0;
              return (
                <div key={item?.id} className="d-flex align-items-center gap-2 mb-2">
                  {product?.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                    />
                  )}
                  <div className="flex-grow-1 small">
                    <div>{product?.title ?? "—"}</div>
                    <div className="text-muted d-flex flex-wrap align-items-center gap-1">
                      <span>{qty} 件 ×</span>
                      <MoneyAmount value={price} />
                    </div>
                  </div>
                </div>
              );
            })}
            <hr />
            <div className="small text-muted d-flex justify-content-between">
              <span>商品小計</span>
              <MoneyAmount value={totalAmount} />
            </div>
            {appliedCoupon && couponDiscount > 0 ? (
              <div className="small text-success d-flex justify-content-between">
                <span>優惠折抵（{appliedCoupon.code}）</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <span aria-hidden>-</span>
                  <MoneyAmount value={couponDiscount} />
                </span>
              </div>
            ) : null}
            <div className="fw-bold text-success mt-2 d-flex flex-wrap justify-content-between align-items-baseline gap-2">
              <span>應付金額：</span>
              <MoneyAmount value={totalAfterCoupon} total className="text-success" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
