/**
 * 結帳步驟 2：填寫資料
 * 除留言外皆必填，使用 React Hook Form 驗證
 * - Email：必填，含 @，僅英文/數字/_/-/.
 * - 收件人手機：必填，09 開頭共 10 碼
 */
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import MoneyAmount from "../common/MoneyAmount";
import { setFormData, setStep, createOrderThunk } from "../../slices/checkoutSlice";
import { showNotification } from "../../slices/notificationSlice";
import {
  selectCarts,
  selectAppliedCoupon,
  selectCartOrderTotals,
} from "../../slices/cartSlice";

const getProduct = (item) => item?.product ?? item;

const DEFAULT_FORM = { email: "", name: "", tel: "", address: "", message: "" };

export default function CheckoutForm() {
  const dispatch = useDispatch();
  const carts = useSelector(selectCarts);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const { productSubtotal, couponDiscount, shippingFee, totalPayable } =
    useSelector(selectCartOrderTotals);
  const { formData } = useSelector((s) => s.checkout);
  const initializedRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: formData ?? DEFAULT_FORM,
    mode: "onTouched",
  });

  /** 僅在初次進入步驟 2 時同步 Redux formData，避免 reset 覆蓋使用者輸入與錯誤狀態 */
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      reset(formData ?? DEFAULT_FORM);
    }
    return () => {
      initializedRef.current = false;
    };
  }, [formData, reset]);

  const onSubmit = async (data) => {
    dispatch(setFormData(data));
    try {
      await dispatch(
        createOrderThunk({
          user: {
            name: data.name,
            email: data.email,
            tel: data.tel,
            address: data.address,
          },
          message: data.message || "",
          couponCode: appliedCoupon?.code ?? null,
        })
      ).unwrap();
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err ?? "建立訂單失敗" }));
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="border-start border-3 border-success ps-2 mb-3">訂購人資訊</h5>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label">Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="請輸入 Email"
                  {...register("email", {
                    required: "請輸入 Email",
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Email 格式不正確（僅限英文、數字、@、.、-、_）",
                    },
                  })}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">收件人姓名 <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  placeholder="請輸入姓名"
                  {...register("name", { required: "請輸入收件人姓名" })}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">收件人手機 <span className="text-danger">*</span></label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className={`form-control ${errors.tel ? "is-invalid" : ""}`}
                  placeholder="請輸入手機"
                  onKeyDown={(e) => {
                    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
                    if (allowed.includes(e.key)) return;
                    if (/^\d$/.test(e.key)) return;
                    e.preventDefault();
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
                    setValue("tel", pasted.slice(0, 10), { shouldValidate: true });
                  }}
                  {...register("tel", {
                    required: "請輸入收件人手機",
                    pattern: {
                      value: /^09\d{8}$/,
                      message: "請輸入正確手機格式（09 開頭，共 10 碼）",
                    },
                  })}
                />
                {errors.tel && <div className="invalid-feedback">{errors.tel.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">收件人地址 <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  placeholder="請輸入地址"
                  {...register("address", { required: "請輸入收件人地址" })}
                />
                {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
              </div>
              <div className="mb-4">
                <label className="form-label">留言</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="選填"
                  {...register("message")}
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => dispatch(setStep(1))}
                >
                  返回購物車
                </button>
                <button type="submit" className="btn btn-success">
                  下一步
                </button>
              </div>
            </form>
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
            <div className="d-flex justify-content-between small text-muted">
              <span>商品小計</span>
              <MoneyAmount value={productSubtotal} />
            </div>
            {appliedCoupon && couponDiscount > 0 ? (
              <div className="d-flex justify-content-between small text-success">
                <span>優惠折抵（{appliedCoupon.code}）</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <span aria-hidden>-</span>
                  <MoneyAmount value={couponDiscount} />
                </span>
              </div>
            ) : null}
            <div className="d-flex justify-content-between small text-muted">
              <span>運費總金額</span>
              <MoneyAmount value={shippingFee} />
            </div>
            <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 fw-bold text-success mt-2">
              <span>預購總金額</span>
              <MoneyAmount value={totalPayable} total className="text-success" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
