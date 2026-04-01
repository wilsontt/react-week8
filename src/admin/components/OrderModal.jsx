/**
 * 訂單檢視/編輯 Modal
 * 顯示訂單明細，並可修改付款狀態
 * 使用 createPortal 渲染至 document.body
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "bootstrap/js/dist/modal";
import MoneyAmount from "../../components/common/MoneyAmount";

export default function OrderModal({ show, order, onClose, onSave }) {
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);

  // 本地狀態：父層應以 key={order.id}（或開啟時唯一 key）重掛，使初值與該筆訂單一致
  const [isPaid, setIsPaid] = useState(() => Boolean(order?.is_paid));

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!modalRef.current) return;
    const el = modalRef.current;
    const modal = new Modal(el);
    modalInstanceRef.current = modal;

    if (show) {
      modal.show();
    }

    const handleHidden = () => {
      onCloseRef.current?.();
    };
    el.addEventListener("hidden.bs.modal", handleHidden);
    return () => {
      el.removeEventListener("hidden.bs.modal", handleHidden);
      modal.hide();
      modal.dispose();
      modalInstanceRef.current = null;
    };
  }, [show]);

  const handleSave = () => {
    if (!order) return;
    const payload = {
      ...order,
      is_paid: isPaid,
    };
    onSave?.(payload);
    modalInstanceRef.current?.hide();
  };

  if (!show || !order) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    return new Date(timestamp * 1000).toLocaleString();
  };

  // aria-hidden 由 Bootstrap show/hide 維護；勿寫在 JSX，避免 state 重 render 覆寫與焦點衝突
  const modalContent = (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="orderModalLabel"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title" id="orderModalLabel">
              訂單明細
            </h5>
            <button type="button" className="btn-close btn-close-white" aria-label="關閉" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            <div className="row g-4">
              {/* 左側：訂購人資訊 */}
              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3 fw-bold">訂購人資訊</h6>
                <table className="table table-borderless table-sm">
                  <tbody>
                    <tr>
                      <th width="100">姓名</th>
                      <td>{order.user?.name}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{order.user?.email}</td>
                    </tr>
                    <tr>
                      <th>電話</th>
                      <td>{order.user?.tel}</td>
                    </tr>
                    <tr>
                      <th>地址</th>
                      <td>{order.user?.address}</td>
                    </tr>
                    <tr>
                      <th>留言</th>
                      <td>{order.message || "無"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 右側：訂單狀態 */}
              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3 fw-bold">訂單狀態</h6>
                <table className="table table-borderless table-sm">
                  <tbody>
                    <tr>
                      <th width="100">訂單編號</th>
                      <td>{order.id}</td>
                    </tr>
                    <tr>
                      <th>建立時間</th>
                      <td>{formatDate(order.create_at)}</td>
                    </tr>
                    <tr>
                      <th>付款狀態</th>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="isPaidSwitch"
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="isPaidSwitch">
                            {isPaid ? (
                              <span className="text-success fw-bold">已付款</span>
                            ) : (
                              <span className="text-danger fw-bold">未付款</span>
                            )}
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 下方：購買商品明細 */}
            <div className="mt-4">
              <h6 className="border-bottom pb-2 mb-3 fw-bold">購買商品</h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>商品名稱</th>
                      <th className="text-center" width="100">數量</th>
                      <th className="text-end" width="120">單價</th>
                      <th className="text-end" width="120">小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(order.products || {}).map((item) => (
                      <tr key={item.id}>
                        <td>{item.product.title}</td>
                        <td className="text-center">{item.qty} / {item.product.unit}</td>
                        <td className="text-end">
                          <MoneyAmount value={item.product.price} />
                        </td>
                        <td className="text-end">
                          <MoneyAmount value={item.final_total} total />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">總計</td>
                      <td className="text-end fw-bold text-success">
                        <MoneyAmount value={Math.round(order.total)} total className="text-success" />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
              取消
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
