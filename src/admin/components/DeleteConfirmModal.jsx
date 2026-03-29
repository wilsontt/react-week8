/**
 * 刪除確認 Modal
 */
import { useEffect, useRef } from "react";
import Modal from "bootstrap/js/dist/modal";

export default function DeleteConfirmModal({ show, title, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!modalRef.current) return;
    const el = modalRef.current;
    const modal = new Modal(el);
    modalInstanceRef.current = modal;

    if (show) {
      modal.show();
    }

    const handleHidden = () => {
      onCancelRef.current?.();
    };
    el.addEventListener("hidden.bs.modal", handleHidden);
    return () => {
      el.removeEventListener("hidden.bs.modal", handleHidden);
      modal.hide();
      modal.dispose();
      modalInstanceRef.current = null;
    };
  }, [show]);

  const handleConfirm = () => {
    onConfirm?.();
    modalInstanceRef.current?.hide();
  };

  // aria-hidden 由 Bootstrap show/hide 維護；勿寫在 JSX，避免父層 render 覆寫與焦點衝突
  return (
    <div className="modal fade" ref={modalRef} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">確認刪除</h5>
            <button type="button" className="btn-close" aria-label="關閉" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            確定要刪除「{title}」嗎？此操作無法復原。
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
              取消
            </button>
            <button type="button" className="btn btn-danger" onClick={handleConfirm}>
              確定刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
