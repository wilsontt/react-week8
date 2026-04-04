/**
 * 刪除確認 Modal
 * 使用 createPortal 掛至 document.body，避免 PageWithLogoBg 等父層 z-index 造成 backdrop 蓋住對話框而無法點擊。
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Modal from "bootstrap/js/dist/modal";
import { MODAL_NO_KEYBOARD } from "../../utils/bootstrapModalOptions";

export default function DeleteConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onClose,
  onCancel,
}) {
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);
  const onDismissRef = useRef(null);
  const dismiss = onClose ?? onCancel;
  useEffect(() => {
    onDismissRef.current = dismiss;
  }, [dismiss]);

  useEffect(() => {
    if (!modalRef.current) return;
    const el = modalRef.current;
    const modal = new Modal(el, MODAL_NO_KEYBOARD);
    modalInstanceRef.current = modal;

    if (show) {
      modal.show();
    }

    const handleHidden = () => {
      onDismissRef.current?.();
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

  if (!show) return null;

  const bodyNode =
    message != null && message !== "" ? (
      message
    ) : (
      <>
        確定要刪除「{title ?? ""}」嗎？此操作無法復原。
      </>
    );

  const modalContent = (
    <div className="modal fade" ref={modalRef} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">確認刪除</h5>
            <button type="button" className="btn-close" aria-label="關閉" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">{bodyNode}</div>
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

  return createPortal(modalContent, document.body);
}
