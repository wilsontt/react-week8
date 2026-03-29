/**
 * 優惠券新增/編輯共用 Modal
 * mode: "add" | "edit"，編輯時傳入 initialData
 * 使用 createPortal 渲染至 document.body，避免父層 stacking context 阻擋輸入
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import Modal from "bootstrap/js/dist/modal";
import { FaCalendarAlt } from "react-icons/fa";

const defaultValues = {
  title: "",
  code: "",
  percent: 0,
  due_date: "",
  is_enabled: false,
};

/** 將 API 日期（Unix 秒或字串）轉為 input[type=date] 格式 YYYY-MM-DD */
function toDateInputValue(val) {
  if (val == null || val === "") return "";
  const d = typeof val === "number" ? new Date(val * 1000) : new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function CouponFormModal({ show, mode, initialData, onClose, onSave }) {
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);
  /** 儲存成功後遞增，由 effect 讀取 modalInstanceRef 關閉視窗（onSubmit 內不讀 ref，通過 react-hooks/refs） */
  const [hideModalToken, setHideModalToken] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        title: initialData.title ?? "",
        code: initialData.code ?? "",
        percent: Number(initialData.percent) || 0,
        due_date: toDateInputValue(initialData.due_date),
        is_enabled: Boolean(initialData.is_enabled),
      });
    } else {
      reset(defaultValues);
    }
  }, [mode, initialData, reset]);

  /** 僅在 effect 內同步 onClose，避免在 render 寫入 ref */
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

  useEffect(() => {
    if (hideModalToken === 0) return;
    modalInstanceRef.current?.hide();
  }, [hideModalToken]);

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      code: data.code,
      percent: Number(data.percent) || 0,
      due_date: data.due_date ? Math.floor(new Date(data.due_date).getTime() / 1000) : null,
      is_enabled: data.is_enabled ? 1 : 0,
    };
    onSave?.(payload);
    setHideModalToken((t) => t + 1);
  };

  const title = mode === "edit" ? "編輯優惠券" : "新增優惠券";

  if (!show) return null;

  // aria-hidden 由 Bootstrap show/hide 維護；勿寫在 JSX，避免 state 重 render 覆寫與焦點衝突
  const modalContent = (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="couponModalLabel"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="couponModalLabel">
              {title}
            </h5>
            <button type="button" className="btn-close" aria-label="關閉" data-bs-dismiss="modal" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">優惠券標題（最多 255 字）</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  placeholder="例如：新會員專屬折扣"
                  maxLength={255}
                  {...register("title", {
                    required: "請輸入優惠券標題",
                    maxLength: { value: 255, message: "優惠券標題不可超過 255 個字" },
                  })}
                />
                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">優惠碼</label>
                <input
                  type="text"
                  className={`form-control ${errors.code ? "is-invalid" : ""}`}
                  placeholder="例如：NEW2024"
                  {...register("code", { required: "請輸入優惠碼" })}
                />
                {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">折扣 (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={`form-control ${errors.percent ? "is-invalid" : ""}`}
                  {...register("percent", {
                    required: "請輸入折扣",
                    min: { value: 0, message: "折扣不可小於 0" },
                    max: { value: 100, message: "折扣不可大於 100" },
                  })}
                />
                {errors.percent && <div className="invalid-feedback">{errors.percent.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">截止日</label>
                <div className="input-group">
                  <input
                    type="date"
                    className={`form-control ${errors.due_date ? "is-invalid" : ""}`}
                    {...register("due_date", { required: "請選擇截止日" })}
                  />
                  <span className="input-group-text">
                    <FaCalendarAlt />
                  </span>
                </div>
                {errors.due_date && <div className="invalid-feedback d-block">{errors.due_date.message}</div>}
              </div>
              <div className="mb-0">
                <label className="form-label d-flex align-items-center gap-2">
                  <span>啟用</span>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      role="switch"
                      {...register("is_enabled")}
                    />
                  </div>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                取消
              </button>
              <button type="submit" className="btn btn-dark">
                儲存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
