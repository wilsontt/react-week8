/**
 * 前台 ProductDetailCard 產品明細卡片元件（Modal）
 * 用於顯示產品明細，依 selectedProduct 決定是否顯示；關閉時呼叫 onClose。
 *
 * Props:
 * - selectedProduct: 產品物件（含 title、imageUrl 等），null 時不渲染
 * - onClose: 關閉 Modal 時由父層呼叫（例如 setSelectedProduct(null)）
 * - onAddToCart: (product, quantity) => void，點「加入購物車」時呼叫
 */
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import Modal from "bootstrap/js/dist/modal";
import { FaStar, FaRegStar, FaCheckCircle } from "react-icons/fa";
import MoneyAmount from "./MoneyAmount";

function ProductDetailCard({ selectedProduct, onClose, onAddToCart }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);
  

  /** 關閉後要導向的路徑（填寫訂單時設為 /cart），在 hidden.bs.modal 時執行 */
  const afterCloseNavigateToRef = useRef(null);

  /** 使用 ref 避免 onClose 納入 modal effect 依賴，防止父層 re-render 時 Modal 閃爍 */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /** 目前顯示的主圖 URL，點副圖可替換 */
  const [currentMainImageUrl, setCurrentMainImageUrl] = useState(
    selectedProduct?.imageUrl ?? ""
  );

  /** 加入購物車數量，開 modal 時重置為 1 */
  const [quantity, setQuantity] = useState(1);

  /** 已按「加入購物車」後是否顯示「繼續購物／完成購物」選項 */
  const [showAfterAddOptions, setShowAfterAddOptions] = useState(false);

  /** 成功畫面圖示：false = 轉圈圈，true = 打勾（約 1.5 秒後切換） */
  const [successIconReady, setSuccessIconReady] = useState(false);

  /** 是否正在加入購物車（送出中），用於防止重複點擊 */
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  /** 成功畫面進入時：約 1.5 秒後改為打勾（successIconReady 在 setShowAfterAddOptions(true) 時已重置為 false） */
  useEffect(() => {
    if (!showAfterAddOptions) return;
    const timer = setTimeout(() => setSuccessIconReady(true), 1500);
    return () => clearTimeout(timer);
  }, [showAfterAddOptions]);

  useEffect(() => {
    if (!selectedProduct || !modalRef.current) return;
    const url = selectedProduct.imageUrl ?? "";
    setTimeout(() => {
      setCurrentMainImageUrl(url);
      setQuantity(1);
      setShowAfterAddOptions(false);
      setSuccessIconReady(false);
      setIsAddingToCart(false);
    }, 0);
    const el = modalRef.current;
    const modal = new Modal(el);
    modalInstanceRef.current = modal;
    modal.show();

    const handleHidden = () => {
      onCloseRef.current?.();
      const path = afterCloseNavigateToRef.current;
      afterCloseNavigateToRef.current = null;
      if (path) navigate(path);
    };
    el.addEventListener("hidden.bs.modal", handleHidden);
    return () => {
      el.removeEventListener("hidden.bs.modal", handleHidden);
      modal.hide();
      modal.dispose();
      modalInstanceRef.current = null;
    };
  }, [selectedProduct, navigate]);

  if (!selectedProduct) {
    return null;
  }

  /** 主圖 + 副圖，供點選替換主圖用 */
  const allImageUrls = Array.from(
    new Set([
      selectedProduct.imageUrl,
      ...(selectedProduct.imagesUrl ?? []),
    ].filter(Boolean))
  );

  // 加入購物車前 計算總金額
  const total = Number(selectedProduct.price) * quantity;

  /**
   * 不可在 JSX 寫死 aria-hidden：Bootstrap 會在 show 時移除、hide 時設回 true；
   * React 在 state 更新後 render 若寫死 aria-hidden="true"，會覆寫成「可見卻仍 hidden」，
   * 與內部焦點衝突（Chrome：Blocked aria-hidden… descendant retained focus）。
   */
  const modalContent = (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="productModalLabel"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="productModalLabel">
              {showAfterAddOptions ? "加入購物車" : selectedProduct.title}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              data-bs-dismiss="modal"
            />
          </div>
          <div
            className="modal-body text-start"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            {showAfterAddOptions ? (
              /* 成功畫面：轉圈 → 打勾、標題、說明、兩顆按鈕 */
              <div className="d-flex flex-column align-items-center justify-content-center py-4">
                <div className="mb-3" style={{ width: 60, height: 60 }}>
                  {!successIconReady ? (
                    <div
                      className="spinner-border text-success"
                      style={{ width: 60, height: 60 }}
                      role="status"
                      aria-label="載入中"
                    >
                      <span className="visually-hidden">載入中</span>
                    </div>
                  ) : (
                    <FaCheckCircle
                      className="text-success"
                      size={60}
                      aria-hidden
                    />
                  )}
                </div>
                <h5 className="fw-bold mb-2">加入購物車成功</h5>
                <p className="text-muted small mb-4">商品已成功加入購物車</p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      afterCloseNavigateToRef.current = "/cart";
                      modalInstanceRef.current?.hide();
                    }}
                  >
                    填寫訂單
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => modalInstanceRef.current?.hide()}
                  >
                    繼續購物
                  </button>
                </div>
              </div>
            ) : (
            <div className="row d-flex justify-content-between align-items-start">
              <div className="col-md-6">
                {currentMainImageUrl ? (
                  <img
                    src={currentMainImageUrl}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    className="rounded px-2 py-2"
                    alt={selectedProduct.title}
                  />
                ) : (
                  <div
                    className="rounded px-2 py-2 bg-light d-flex align-items-center justify-content-center"
                    style={{ width: "100%", height: "200px" }}
                    aria-hidden
                  >
                    <span className="text-muted small">圖片載入中</span>
                  </div>
                )}
                {allImageUrls.length > 0 && (
                  <div className="d-flex flex-nowrap gap-1 mt-2 px-2">
                    {allImageUrls.map((url) => (
                      <button
                        key={url}
                        type="button"
                        className="border rounded p-0 overflow-hidden"
                        style={{
                          width: 56,
                          height: 56,
                          flexShrink: 0,
                          borderColor:
                            url === currentMainImageUrl
                              ? "var(--bs-primary)"
                              : "#dee2e6",
                          borderWidth: url === currentMainImageUrl ? 2 : 1,
                        }}
                        onClick={() => setCurrentMainImageUrl(url)}
                      >
                        {url ? (
                          <img
                            src={url}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span className="small text-muted">圖</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <div className="row g-2 align-items-baseline">
                  <div className="col-md-3 text-md-start text-muted small">價格</div>
                  <div className="col-md-9 d-flex flex-wrap align-items-center gap-2 justify-content-md-end">
                    <span className="text-decoration-line-through opacity-75">
                      <span className="small text-muted me-1">原價</span>
                      <MoneyAmount value={Number(selectedProduct.origin_price)} />
                    </span>
                    <span className="text-danger fw-bold d-inline-flex align-items-baseline gap-1 flex-wrap">
                      <span className="fs-6">促銷價</span>
                      <MoneyAmount value={Number(selectedProduct.price)} className="fs-4 fw-bold text-danger" />
                    </span>
                  </div>
                  <div className="row">
                    <div className="col-3 text-left g2">單位：{selectedProduct.unit}</div>
                    <div className="col-3 text-left text-lg-end g2 d-flex align-items-center gap-1">
                      {/* 用顆星顯示星級 */}
                      {[1, 2, 3, 4, 5].map((i) =>
                        i <= (selectedProduct.rating ?? 0) ? (
                          <FaStar key={i} className="text-warning" size={24} />
                        ) : (
                          <FaRegStar key={i} className="text-secondary" size={24} />
                        )
                      )}
                    </div>
                  </div>
                  <div className="row mt-2">
                    <label className="w-100 mb-1 fw-bold">數量：</label>
                    <div className="col-auto d-flex align-items-center border rounded">
                      <button
                        type="button"
                        className="btn btn-outline-primary rounded-0 rounded-start"
                        aria-label="減少數量"
                        onClick={() =>
                          setQuantity((q) => (q <= 1 ? 1 : q - 1))
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setQuantity(Number.isNaN(v) || v < 1 ? 1 : v);
                        }}
                        className="form-control border-0 text-center"
                        style={{ width: 65 }}
                        aria-label="數量"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary rounded-0 rounded-end"
                        aria-label="增加數量"
                        onClick={() => setQuantity((q) => q + 1)}
                      >
                        +
                      </button>
                    </div>
                    <label className="w-100 mb-1 fw-bold d-flex flex-wrap align-items-baseline gap-2">
                      <span>金額</span>
                      <MoneyAmount value={total} total />
                    </label>
                  </div>
                  {/* 加入購物車按鈕 及 繼續購物/填寫訂單 按鈕 */}
                  <div className="row mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={isAddingToCart}
                      onClick={async () => {
                        if (isAddingToCart) return;
                        setIsAddingToCart(true);
                        try {
                          await onAddToCart?.(selectedProduct, quantity);
                          setSuccessIconReady(false);
                          setShowAfterAddOptions(true);
                        } catch {
                          setIsAddingToCart(false);
                        }
                      }}
                    >
                      {isAddingToCart ? "處理中…" : "加入購物車"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="row mt-2 gap-2 p-0 text-left">
                <div className="w-100">
                  <p className="fw-bold mb-1 px-3">商品說明</p>
                  <p className="small text-muted mb-1 px-3">產品特色與適用情境</p>
                  <div
                    className="small text-break px-3"
                    style={{ overflowWrap: "break-word", whiteSpace: "pre-wrap" }}
                  >
                    {selectedProduct.description || "本商品說明由廠商提供，如有疑問歡迎聯繫客服。"}
                  </div>
                </div>
                <div className="w-100">
                  <p className="fw-bold mb-1 px-3">商品內容</p>
                  <p className="small text-muted mb-1 px-3">規格、成分或使用方式等詳細資訊</p>
                  <div
                    className="small text-break px-3"
                    style={{ overflowWrap: "break-word", whiteSpace: "pre-wrap" }}
                  >
                    {selectedProduct.content || "詳細內容請見商品外包裝標示，或來信客服諮詢。"}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
          {!showAfterAddOptions && (
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              關閉
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ProductDetailCard;
