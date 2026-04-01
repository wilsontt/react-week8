/**
 * 客戶購物車頁面
 *
 * 版面：
 * - 左欄：購物清單（米色標題列；md 以下一筆一卡，md 以上表格）
 * - 右欄：訂單金額＋優惠券（上）、清空／繼續購物／總計／前往結帳（下）
 * - 結帳流程 `CheckoutFlow` 顯示於整個購物車區塊下方
 *
 * 互動（與 ProductList 一致）：
 * - 數量：圓形邊框的「−／＋」按鈕呼叫 `updateCartQty`，非下拉選單
 * - 刪除單筆：圓形 `FaTrash` 按鈕呼叫 `removeCartItem`
 * - 優惠券：呼叫客戶端 POST /coupon 驗證（不需後台登入）；成功／失敗／移除皆透過 `showNotification`
 * - 取消結帳：按鈕 class `cart-checkout-cancel-btn`，hover 藍底白字（Cart.css）
 */
import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import PageWithLogoBg from "../components/common/PageWithLogoBg";
import {
  selectCarts,
  selectCartLoading,
  selectCartError,
  selectTotalQty,
  selectTotalAmount,
  selectAppliedCoupon,
  selectCouponDiscountAmount,
  updateCartQty,
  removeCartItem,
  clearCart,
  setAppliedCoupon,
  clearAppliedCoupon,
} from "../slices/cartSlice";
import * as couponApi from "../services/couponApi";
import {
  pickCouponFromCustomerValidateBody,
  unwrapCustomerCouponResponse,
  isCustomerCouponApiSuccess,
  isImplicitCustomerCouponSuccessBody,
  isCouponPastDueDate,
  isCouponActiveEnabled,
  formatCouponDueDateDisplay,
  findCouponByCode,
  impliedPercentFromSubtotalAndFinalTotal,
  readPercentFromObject,
  resolveDiscountForAppliedCoupon,
} from "../utils/couponClient";
import { startCheckout, cancelCheckout, selectCheckout } from "../slices/checkoutSlice";
import { showNotification } from "../slices/notificationSlice";
import CheckoutFlow from "../components/checkout/CheckoutFlow";
import Pagination from "../components/common/Pagination";
import MoneyAmount from "../components/common/MoneyAmount";
import "./Cart.css";

const ITEMS_PER_PAGE = 5;

/** 固定運費（展示用；無 API 時使用） */
const SHIPPING_FEE = 120;

/**
 * 訂單側欄金額一次算出（小計、折抵、運費、應付），避免多個 selector 拆算時不一致
 */
const selectCartOrderTotals = createSelector(
  [selectTotalAmount, selectCouponDiscountAmount],
  (subtotal, discount) => {
    const afterCoupon = Math.max(0, subtotal - discount);
    const shippingFee = afterCoupon > 0 ? SHIPPING_FEE : 0;
    return {
      productSubtotal: subtotal,
      couponDiscount: discount,
      afterCoupon,
      shippingFee,
      totalPayable: afterCoupon + shippingFee,
    };
  }
);

/**
 * @param {unknown} item
 * @returns {Record<string, unknown> | null}
 */
function getProduct(item) {
  if (!item || typeof item !== "object") return null;
  const p = item.product ?? item;
  return p && typeof p === "object" ? p : null;
}

/**
 * 商品副標題：描述摘錄或分類
 * @param {Record<string, unknown> | null} product
 */
function getProductSubtitle(product) {
  if (!product) return "";
  const desc = typeof product.description === "string" ? product.description.trim() : "";
  if (desc) {
    const line = desc.split(/\r?\n/)[0]?.trim() ?? "";
    return line.length > 48 ? `${line.slice(0, 48)}…` : line;
  }
  const cat = typeof product.category === "string" ? product.category : "";
  return cat;
}

/**
 * 卡片頂部小字：僅分類（與簡述分開，避免重複）
 * @param {Record<string, unknown> | null} product
 */
function getProductCategory(product) {
  if (!product) return "";
  const c = typeof product.category === "string" ? product.category.trim() : "";
  return c;
}

/**
 * 卡片內簡述：僅取描述首行，不用 overflow-wrap:anywhere，避免一字一行
 * @param {Record<string, unknown> | null} product
 */
function getProductDescriptionExcerpt(product) {
  if (!product) return "";
  const desc = typeof product.description === "string" ? product.description.trim() : "";
  if (!desc) return "";
  const line = desc.split(/\r?\n/)[0]?.trim() ?? "";
  return line.length > 72 ? `${line.slice(0, 72)}…` : line;
}

export default function Cart() {
  const dispatch = useDispatch();
  const store = useStore();
  const navigate = useNavigate();
  const carts = useSelector(selectCarts);
  const [currentPage, setCurrentPage] = useState(1);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplyLoading, setCouponApplyLoading] = useState(false);

  const { slicedCarts, pagination } = useMemo(() => {
    const total = carts.length;
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    const page = Math.min(Math.max(1, currentPage), totalPages);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      slicedCarts: carts.slice(start, end),
      pagination: {
        total_pages: totalPages,
        current_page: page,
        has_pre: page > 1,
        has_next: page < totalPages,
      },
    };
  }, [carts, currentPage]);

  const { showCheckout } = useSelector(selectCheckout);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const totalQty = useSelector(selectTotalQty);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const { productSubtotal, couponDiscount, shippingFee, totalPayable } =
    useSelector(selectCartOrderTotals);

  /**
   * 套用／清除優惠券
   * 流程：validateCustomerCouponCode（客戶 API，免後台登入）→ 檢查 is_enabled、due_date → 寫入 Redux appliedCoupon
   * 錯誤與成功訊息一律 `dispatch(showNotification)`，不使用 `window.alert`
   * @returns {Promise<void>}
   */
  const handleApplyCoupon = useCallback(async () => {
    const raw = couponInput.trim();
    /* 輸入為空：僅在「先前已有套用」時提示移除，避免重複打擾使用者 */
    if (!raw) {
      if (appliedCoupon) {
        dispatch(clearAppliedCoupon());
        dispatch(showNotification({ type: "success", message: "已移除優惠券套用" }));
      } else {
        dispatch(clearAppliedCoupon());
      }
      return;
    }
    setCouponApplyLoading(true);
    try {
      const rawRes = await couponApi.validateCustomerCouponCode(raw);
      const res = unwrapCustomerCouponResponse(rawRes) ?? rawRes;
      if (!isCustomerCouponApiSuccess(res) && !isImplicitCustomerCouponSuccessBody(res)) {
        dispatch(clearAppliedCoupon());
        dispatch(
          showNotification({
            type: "error",
            message:
              typeof res?.message === "string" && res.message.trim()
                ? res.message
                : `查無此優惠碼「${raw}」，請確認後再試。`,
          })
        );
        return;
      }
      const match = pickCouponFromCustomerValidateBody(res, raw);
      if (!match) {
        dispatch(clearAppliedCoupon());
        dispatch(
          showNotification({
            type: "error",
            message: "優惠碼驗證回傳格式異常，請稍後再試或聯絡客服。",
          })
        );
        return;
      }
      const codeDisplay = String(match.code ?? raw);
      /** 客戶端驗證成功且未帶 is_enabled 時，視為已啟用（與後台列表欄位語意不同） */
      if ("is_enabled" in match && !isCouponActiveEnabled(match.is_enabled)) {
        dispatch(
          showNotification({
            type: "error",
            message: `該優惠券（優惠碼：${codeDisplay}）尚未啟用，敬請見諒。`,
          })
        );
        dispatch(clearAppliedCoupon());
        return;
      }
      if ("due_date" in match && isCouponPastDueDate(match.due_date)) {
        const dueStr = formatCouponDueDateDisplay(match.due_date);
        dispatch(
          showNotification({
            type: "error",
            message: `該優惠券（優惠碼：${codeDisplay}）已超過截止日期：${dueStr}`,
          })
        );
        dispatch(clearAppliedCoupon());
        return;
      }
      let { percent: pct, fixedDiscountAmount: fixedAmt, finalTotal: apiFinalTotal } =
        resolveDiscountForAppliedCoupon(match, codeDisplay, rawRes, res);
      /** ec-courses POST /coupon 常只回 `data.final_total`，依當下商品小計反推折扣％（訪客可用） */
      if (pct <= 0 && !(fixedAmt > 0) && apiFinalTotal != null) {
        const subtotalNow = selectTotalAmount(store.getState());
        const implied = impliedPercentFromSubtotalAndFinalTotal(subtotalNow, apiFinalTotal);
        if (implied > 0) {
          pct = Math.max(pct, implied);
        }
      }
      /** 客戶 API 未帶折數且無 final_total 時，嘗試 admin 列表補齊 percent（有 hexToken 時可取得） */
      if (pct <= 0 && !(fixedAmt > 0)) {
        try {
          const all = await couponApi.fetchAllCoupons();
          const adminHit = findCouponByCode(all, codeDisplay);
          if (adminHit) {
            pct = Math.max(pct, readPercentFromObject(adminHit));
          }
        } catch {
          /* 訪客無 Token 時預期失敗 */
        }
      }
      const payload = {
        code: codeDisplay,
        percent: pct > 0 ? Math.min(100, Math.floor(pct)) : 0,
        title: typeof match.title === "string" ? match.title : "",
      };
      if (pct <= 0 && fixedAmt > 0) {
        payload.fixedDiscountAmount = Math.floor(fixedAmt);
      }
      dispatch(setAppliedCoupon(payload));
      dispatch(
        showNotification({
          type: "success",
          message:
            pct > 0
              ? `已套用優惠券「${codeDisplay}」（${payload.percent}% 折扣）`
              : fixedAmt > 0
                ? `已套用優惠券「${codeDisplay}」（折抵 NT$ ${Math.floor(fixedAmt)}）`
                : `已套用優惠券「${codeDisplay}」`,
        })
      );
    } catch (err) {
      dispatch(clearAppliedCoupon());
      const msg =
        err?.response?.data?.message ?? "無法驗證優惠碼，請檢查網路後再試。";
      dispatch(showNotification({ type: "error", message: msg }));
    } finally {
      setCouponApplyLoading(false);
    }
  }, [couponInput, dispatch, appliedCoupon, store]);

  const handleClearAll = useCallback(() => {
    if (showCheckout) return;
    dispatch(clearCart());
    dispatch(clearAppliedCoupon());
    setCouponInput("");
  }, [dispatch, showCheckout]);

  if (loading && carts.length === 0) {
    return (
      <PageWithLogoBg className="container-fluid" alignTop>
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">載入中</span>
          </div>
          <p className="mt-2 text-muted">載入購物車中…</p>
        </div>
      </PageWithLogoBg>
    );
  }

  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <div className="container py-4 cart-page">
        <h2 className="mb-4 d-flex align-items-center gap-2 text-start">
          <FaShoppingCart className="text-success" size={28} />
          客戶購物車
        </h2>

        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
            <span className="ms-2 small">（購物車需登入後使用，請至後台管理登入）</span>
          </div>
        )}

        {carts.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <FaShoppingCart className="text-muted mb-3" size={64} />
              <h5 className="text-muted">購物車是空的</h5>
              <p className="text-muted small mb-4">快去挑選喜歡的商品吧！</p>
              <Link to="/productList" className="btn btn-success">
                前往產品列表
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-4 align-items-start">
              {/* 左欄：購物清單（xl 以下與側欄直向堆疊，避免平板並排壓縮表格） */}
              <div className="col-12 col-xl-8">
                <div className="cart-page__list-wrap">
                  <div className="cart-page__list-header">
                    <h3 className="cart-page__list-title">購物車</h3>
                    <button
                      type="button"
                      className="cart-page__link-delete-all"
                      onClick={handleClearAll}
                      disabled={showCheckout}
                    >
                      全部刪除
                    </button>
                  </div>
                  {/* 窄螢幕（Bootstrap md 以下）：一筆一卡，文字區佔滿剩餘寬 */}
                  <div className="cart-page__card-list d-md-none" role="list">
                    {slicedCarts.map((item) => {
                      const product = getProduct(item);
                      const qty = item?.qty ?? 0;
                      const price = Number(product?.price ?? 0);
                      const originPrice = Number(product?.origin_price ?? 0);
                      const lineTotal = price * qty;
                      const category = getProductCategory(product);
                      const descExcerpt = getProductDescriptionExcerpt(product);
                      const showOriginStrike =
                        Number.isFinite(originPrice) &&
                        originPrice > 0 &&
                        originPrice > price;
                      return (
                        <article
                          key={item.id}
                          className="cart-page__item-card"
                          role="listitem"
                        >
                          <div className="cart-page__item-card-top">
                            <div className="cart-page__item-card-thumb-wrap">
                              {product?.imageUrl ? (
                                <img
                                  src={String(product.imageUrl)}
                                  alt={String(product?.title ?? "商品")}
                                  className="cart-page__item-card-thumb"
                                />
                              ) : (
                                <div className="cart-page__item-card-thumb cart-page__item-card-thumb--placeholder">
                                  無圖
                                </div>
                              )}
                            </div>
                            <div className="cart-page__item-card-text-col">
                              <div
                                className={`cart-page__item-card-meta-row${category ? "" : " cart-page__item-card-meta-row--no-cat"}`}
                              >
                                {category ? (
                                  <span className="cart-page__item-card-cat">{category}</span>
                                ) : null}
                                <button
                                  type="button"
                                  className="cart-page__item-card-remove"
                                  aria-label="刪除此項目"
                                  disabled={showCheckout}
                                  onClick={() => dispatch(removeCartItem(item.id))}
                                >
                                  <FaTrash size={16} />
                                </button>
                              </div>
                              <div className="cart-page__item-card-title">
                                {product?.title ?? "—"}
                              </div>
                              {descExcerpt ? (
                                <div className="cart-page__item-card-desc">{descExcerpt}</div>
                              ) : null}
                            </div>
                          </div>
                          <div className="cart-page__item-card-bottom">
                            <div className="d-flex align-items-center justify-content-center gap-1 cart-page__qty-wrap">
                              <button
                                type="button"
                                className="cart-page__qty-btn--minus btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                style={{ width: 32, height: 32 }}
                                aria-label="減少數量"
                                disabled={showCheckout || qty <= 1}
                                onClick={() =>
                                  dispatch(
                                    updateCartQty({
                                      cartId: item.id,
                                      qty: qty - 1,
                                      productId: product?.id,
                                    })
                                  )
                                }
                              >
                                <FaMinus size={12} />
                              </button>
                              <span className="cart-page__qty-num px-1">{qty}</span>
                              <button
                                type="button"
                                className="cart-page__qty-btn--plus btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                style={{ width: 32, height: 32 }}
                                aria-label="增加數量"
                                disabled={showCheckout}
                                onClick={() =>
                                  dispatch(
                                    updateCartQty({
                                      cartId: item.id,
                                      qty: qty + 1,
                                      productId: product?.id,
                                    })
                                  )
                                }
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>
                            <div className="cart-page__item-card-prices-row">
                              {showOriginStrike ? (
                                <span className="cart-page__item-card-origin">
                                  <MoneyAmount value={originPrice} />
                                </span>
                              ) : null}
                              <span className="cart-page__item-card-line-total">
                                <MoneyAmount value={lineTotal} total />
                              </span>
                              <span className="cart-page__item-card-unit small text-muted">
                                單價{" "}
                                <MoneyAmount value={price} />
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="d-none d-md-block table-responsive">
                    <table className="table mb-0 cart-page__table">
                      <thead>
                        <tr>
                          <th className="cart-page__th-product">商品</th>
                          <th className="text-end cart-page__th-narrow">單價</th>
                          <th className="text-center cart-page__th-qty">數量</th>
                          <th className="text-end cart-page__th-narrow">總價</th>
                          <th className="text-center cart-page__th-action">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slicedCarts.map((item) => {
                          const product = getProduct(item);
                          const qty = item?.qty ?? 0;
                          const price = Number(product?.price ?? 0);
                          const lineTotal = price * qty;
                          const subtitle = getProductSubtitle(product);
                          return (
                            <tr key={item.id}>
                              <td className="cart-page__td-product">
                                <div className="d-flex align-items-center gap-2 gap-sm-3 cart-page__product-cell">
                                  {product?.imageUrl ? (
                                    <img
                                      src={String(product.imageUrl)}
                                      alt={String(product?.title ?? "")}
                                      className="cart-page__product-thumb"
                                    />
                                  ) : (
                                    <div
                                      className="cart-page__product-thumb bg-light d-flex align-items-center justify-content-center text-muted small"
                                      style={{ minWidth: 72 }}
                                    >
                                      無圖
                                    </div>
                                  )}
                                  <div className="text-start flex-grow-1 min-w-0 cart-page__product-text">
                                    <div className="fw-medium text-break">{product?.title ?? "—"}</div>
                                    {subtitle ? (
                                      <div className="cart-page__product-sub">{subtitle}</div>
                                    ) : null}
                                  </div>
                                </div>
                              </td>
                              <td className="text-end">
                                <MoneyAmount value={price} />
                              </td>
                              {/* 數量：桌機橫向 − 數字 ＋；平板以下改直向 ＋／數字／−（見 Cart.css） */}
                              <td className="text-center cart-page__td-qty">
                                <div className="d-flex align-items-center justify-content-center gap-1 cart-page__qty-wrap">
                                  <button
                                    type="button"
                                    className="cart-page__qty-btn--minus btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                    style={{ width: 32, height: 32 }}
                                    aria-label="減少數量"
                                    disabled={showCheckout || qty <= 1}
                                    onClick={() =>
                                      dispatch(
                                        updateCartQty({
                                          cartId: item.id,
                                          qty: qty - 1,
                                          productId: product?.id,
                                        })
                                      )
                                    }
                                  >
                                    <FaMinus size={12} />
                                  </button>
                                  <span className="cart-page__qty-num px-1">{qty}</span>
                                  <button
                                    type="button"
                                    className="cart-page__qty-btn--plus btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                    style={{ width: 32, height: 32 }}
                                    aria-label="增加數量"
                                    disabled={showCheckout}
                                    onClick={() =>
                                      dispatch(
                                        updateCartQty({
                                          cartId: item.id,
                                          qty: qty + 1,
                                          productId: product?.id,
                                        })
                                      )
                                    }
                                  >
                                    <FaPlus size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="text-end fw-semibold">
                                <MoneyAmount value={lineTotal} total />
                              </td>
                              {/* 操作：僅圖示刪除（FaTrash），非文字連結 */}
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center mx-auto"
                                  style={{ width: 36, height: 36 }}
                                  aria-label="刪除此項目"
                                  disabled={showCheckout}
                                  onClick={() => dispatch(removeCartItem(item.id))}
                                >
                                  <FaTrash size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {pagination.total_pages > 1 && (
                  <div className="mt-3 mb-2 mb-md-0 cart-page__list-pagination">
                    <Pagination pagination={pagination} onChangePage={(page) => setCurrentPage(page)} />
                  </div>
                )}
              </div>

              {/* 右欄：上＝訂單金額＋優惠券；下＝清空／繼續購物／總計／前往結帳 */}
              <div className="col-12 col-xl-4">
                <div className="cart-page__sidebar">
                  <h4 className="cart-page__sidebar-header">訂單內容</h4>
                  <div className="cart-page__sidebar-body">
                    <div className="cart-page__coupon-label">優惠券</div>
                    <div className="cart-page__coupon-row">
                      {/*
                        優惠碼 maxLength 須足以容納後台完整字串（可含空格）。
                        過短會截斷輸入 → 與 API 比對失敗 → 誤顯「查無此優惠碼」（其實可能是過期／未啟用）。
                      */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="輸入優惠券代碼"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={showCheckout}
                        maxLength={255}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary cart-page__coupon-apply"
                        onClick={() => {
                          void handleApplyCoupon();
                        }}
                        disabled={showCheckout || couponApplyLoading}
                      >
                        {couponApplyLoading ? "查詢中…" : "套用"}
                      </button>
                    </div>
                    {appliedCoupon ? (
                      <p className="small text-success mb-2">
                        已套用優惠：{appliedCoupon.code}
                        {appliedCoupon.percent > 0
                          ? `（${appliedCoupon.percent}% 折扣）`
                          : appliedCoupon.fixedDiscountAmount > 0
                            ? `（折抵 NT$ ${Number(appliedCoupon.fixedDiscountAmount).toLocaleString()}）`
                            : ""}
                      </p>
                    ) : null}

                    <div className="cart-page__summary-row">
                      <span>商品總金額</span>
                      <MoneyAmount value={productSubtotal} />
                    </div>
                    {couponDiscount > 0 ? (
                      <div className="cart-page__summary-row text-success">
                        <span>優惠折抵</span>
                        <span className="d-inline-flex align-items-center gap-1">
                          <span aria-hidden>-</span>
                          <MoneyAmount value={couponDiscount} />
                        </span>
                      </div>
                    ) : null}
                    <div className="cart-page__summary-row">
                      <span>運費總金額</span>
                      <MoneyAmount value={shippingFee} />
                    </div>
                    <div className="cart-page__summary-row cart-page__summary-row--total">
                      <span>總付款金額</span>
                      <MoneyAmount value={totalPayable} total />
                    </div>
                  </div>

                  <div className="cart-page__sidebar-actions">
                    <div className="cart-page__actions-row">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleClearAll}
                        disabled={showCheckout}
                      >
                        清空購物車
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate("/productList")}
                        disabled={showCheckout}
                      >
                        繼續購物
                      </button>
                    </div>
                    <div className="cart-page__total-line d-flex flex-wrap align-items-baseline gap-2">
                      <span>總計：</span>
                      <MoneyAmount value={totalPayable} total className="text-success" />
                      <span className="text-muted fw-normal small">（共 {totalQty} 件）</span>
                    </div>
                    <button
                      type="button"
                      className="cart-page__btn-checkout"
                      onClick={() => dispatch(startCheckout())}
                      disabled={showCheckout}
                    >
                      前往結帳
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 結帳流程：維持在購物車區塊下方 */}
            {showCheckout && (
              <div className="mt-4">
                <div className="d-flex justify-content-end mb-2">
                  {/*
                    cart-checkout-cancel-btn：預設 outline-secondary；
                    :hover 時藍底白字（見 Cart.css），滑鼠移開恢復
                  */}
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm cart-checkout-cancel-btn"
                    onClick={() => dispatch(cancelCheckout())}
                  >
                    取消結帳
                  </button>
                </div>
                <CheckoutFlow />
              </div>
            )}
          </>
        )}
      </div>
    </PageWithLogoBg>
  );
}
