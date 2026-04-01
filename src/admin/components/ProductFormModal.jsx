/**
 * 產品新增/編輯共用 Modal
 * mode: "add" | "edit"，編輯時傳入 initialData
 * 使用 createPortal 渲染至 document.body，避免父層 stacking context 阻擋輸入
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import Modal from "bootstrap/js/dist/modal";
import { uploadImage } from "../../services/adminProductApi";

/** 主圖 + 副圖合計上限；超過後鎖上傳，須先刪除圖片 */
const MAX_PRODUCT_IMAGES = 5;

/**
 * 在表單內單行 input / checkbox 按 Enter 時，瀏覽器會誤觸發整張表單 submit。
 * 圖片區操作未完成前應避免送出，攔截 Enter。
 * @param {import("react").KeyboardEvent<HTMLElement>} event
 */
function suppressEnterFormSubmit(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
}

function buildDefaultValues() {
  /** 建立全新預設值，避免陣列引用被沿用 */
  return {
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: false,
    imageUrl: "",
    imagesUrl: [""],
  };
}

export default function ProductFormModal({ show, mode, initialData, onClose, onSave }) {
  const modalRef = useRef(null);
  const modalInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageSourceUrl, setImageSourceUrl] = useState("");
  const [imageSourceFile, setImageSourceFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageKeys, setSelectedImageKeys] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: buildDefaultValues(),
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl") || "";
  const rawImagesUrl = watch("imagesUrl");
  const imagesUrl = useMemo(() => rawImagesUrl ?? [], [rawImagesUrl]);

  /**
   * 將主圖與副圖整合為同一份可渲染清單
   * 目的：統一單筆刪除/批次勾選/預覽顯示邏輯
   */
  const imageItems = useMemo(() => {
    const items = [];
    if (imageUrl) {
      items.push({ key: "main", label: "主圖", url: imageUrl, isMain: true, subIndex: -1 });
    }
    imagesUrl.forEach((url, index) => {
      if (url) {
        items.push({
          key: `sub-${index}`,
          label: `副圖 ${index + 1}`,
          url,
          isMain: false,
          subIndex: index,
        });
      }
    });
    return items;
  }, [imageUrl, imagesUrl]);

  /** 目前有效圖片張數（與 imageItems 一致） */
  const imageCount = imageItems.length;
  const isAtImageLimit = imageCount >= MAX_PRODUCT_IMAGES;

  useEffect(() => {
    if (!show) return;
    /** Modal 每次開啟都重置暫存上傳狀態，避免殘留上次選擇 */
    setImageSourceUrl("");
    setImageSourceFile(null);
    setSelectedImageKeys([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (mode === "edit" && initialData) {
      reset({
        title: initialData.title ?? "",
        category: initialData.category ?? "",
        unit: initialData.unit ?? "",
        origin_price: initialData.origin_price ?? "",
        price: initialData.price ?? "",
        description: initialData.description ?? "",
        content: initialData.content ?? "",
        is_enabled: Boolean(initialData.is_enabled),
        imageUrl: initialData.imageUrl ?? "",
        imagesUrl: initialData.imagesUrl?.length ? initialData.imagesUrl : [""],
      });
    } else {
      reset(buildDefaultValues());
    }
  }, [show, mode, initialData, reset]);

  const isUploadReady = imageSourceUrl.trim() !== "" || Boolean(imageSourceFile);

  const clearUploadInputs = () => {
    setImageSourceUrl("");
    setImageSourceFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadImage = async () => {
    if (!isUploadReady || uploadingImage) return;
    if (isAtImageLimit) {
      window.alert(
        `每個產品最多 ${MAX_PRODUCT_IMAGES} 張圖片（含主圖），請先刪除現有圖片後再上傳。`
      );
      return;
    }
    setUploadingImage(true);
    try {
      /** 來源一：直接使用網址 */
      let finalImageUrl = imageSourceUrl.trim();
      /** 來源二：本地檔案先上傳，再取回 imageUrl */
      if (imageSourceFile) {
        const res = await uploadImage(imageSourceFile);
        finalImageUrl = res?.imageUrl ?? res?.data?.imageUrl ?? "";
      }
      if (!finalImageUrl) {
        window.alert("上傳失敗：找不到圖片網址");
        return;
      }

      /** 第一次上傳填入主圖，其餘依序進副圖 */
      if (!imageUrl) {
        setValue("imageUrl", finalImageUrl, { shouldDirty: true });
      } else {
        setValue("imagesUrl", [...imagesUrl, finalImageUrl], { shouldDirty: true });
      }
      clearUploadInputs();
    } catch (error) {
      const message = error?.response?.data?.message ?? "圖片上傳失敗";
      window.alert(message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleImageSelect = (imageKey) => {
    setSelectedImageKeys((prev) =>
      prev.includes(imageKey) ? prev.filter((k) => k !== imageKey) : [...prev, imageKey]
    );
  };

  const removeImageByKey = (imageKey) => {
    /** key=main 代表主圖；key=sub-{index} 代表副圖 */
    if (imageKey === "main") {
      setValue("imageUrl", "", { shouldDirty: true });
      return;
    }
    if (!imageKey.startsWith("sub-")) return;
    const index = Number(imageKey.replace("sub-", ""));
    if (Number.isNaN(index)) return;
    setValue(
      "imagesUrl",
      imagesUrl.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleDeleteSingleImage = (imageKey) => {
    const ok = window.confirm("確定要刪除這張圖片嗎？");
    if (!ok) return;
    removeImageByKey(imageKey);
    setSelectedImageKeys((prev) => prev.filter((k) => k !== imageKey));
  };

  const handleDeleteSelectedImages = () => {
    if (selectedImageKeys.length === 0) return;
    const ok = window.confirm(`確定要刪除已勾選的 ${selectedImageKeys.length} 張圖片嗎？`);
    if (!ok) return;
    const deleteSet = new Set(selectedImageKeys);
    /** 批次刪除可同時包含主圖與副圖 */
    if (deleteSet.has("main")) {
      setValue("imageUrl", "", { shouldDirty: true });
    }
    setValue(
      "imagesUrl",
      imagesUrl.filter((_, index) => !deleteSet.has(`sub-${index}`)),
      { shouldDirty: true }
    );
    setSelectedImageKeys([]);
  };

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

  const onSubmit = (data) => {
    /** 送出前將型別與圖片陣列整理為 API 需要的格式 */
    const trimmedMain = (data.imageUrl ?? "").trim();
    const filteredSubs = data.imagesUrl.filter((url) => url.trim() !== "");
    const totalImages = (trimmedMain ? 1 : 0) + filteredSubs.length;
    if (totalImages > MAX_PRODUCT_IMAGES) {
      window.alert(
        `圖片共 ${totalImages} 張，超過上限 ${MAX_PRODUCT_IMAGES} 張（含主圖）。請刪除多餘圖片後再儲存。`
      );
      return;
    }
    const payload = {
      ...data,
      origin_price: Number(data.origin_price),
      price: Number(data.price),
      is_enabled: data.is_enabled ? 1 : 0,
      imageUrl: trimmedMain,
      imagesUrl: filteredSubs,
    };
    onSave?.(payload);
    modalInstanceRef.current?.hide();
  };

  const title = mode === "edit" ? "編輯產品" : "新增產品";

  if (!show) return null;

  // aria-hidden 由 Bootstrap show/hide 維護；勿寫在 JSX，避免 state 重 render 覆寫與焦點衝突
  const modalContent = (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="productModalLabel"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title" id="productModalLabel">
              {title}
            </h5>
            <button type="button" className="btn-close btn-close-white" aria-label="關閉" data-bs-dismiss="modal" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="row">
                {/* 右側：內容區 */}
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label className="form-label">標題 <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${errors.title ? "is-invalid" : ""}`}
                      placeholder="請輸入標題"
                      {...register("title", { required: "請輸入標題" })}
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">分類 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${errors.category ? "is-invalid" : ""}`}
                        placeholder="請輸入分類"
                        {...register("category", { required: "請輸入分類" })}
                      />
                      {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">單位 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${errors.unit ? "is-invalid" : ""}`}
                        placeholder="請輸入單位"
                        {...register("unit", { required: "請輸入單位" })}
                      />
                      {errors.unit && <div className="invalid-feedback">{errors.unit.message}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">原價 <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        min="0"
                        className={`form-control ${errors.origin_price ? "is-invalid" : ""}`}
                        placeholder="請輸入原價"
                        {...register("origin_price", { required: "請輸入原價", min: { value: 0, message: "不可小於 0" } })}
                      />
                      {errors.origin_price && <div className="invalid-feedback">{errors.origin_price.message}</div>}
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">售價 <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        min="0"
                        className={`form-control ${errors.price ? "is-invalid" : ""}`}
                        placeholder="請輸入售價"
                        {...register("price", { required: "請輸入售價", min: { value: 0, message: "不可小於 0" } })}
                      />
                      {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label className="form-label">產品描述</label>
                    <textarea
                      className="form-control"
                      placeholder="請輸入產品描述"
                      rows={3}
                      {...register("description")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">說明內容</label>
                    <textarea
                      className="form-control"
                      placeholder="請輸入說明內容"
                      rows={3}
                      {...register("content")}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="is_enabled"
                        {...register("is_enabled")}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* 左側：圖片區 */}
                <div className="col-sm-4">
                  <div className="mb-3">
                    <label className="form-label">圖片來源網址</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="請輸入圖片網址"
                      value={imageSourceUrl}
                      onChange={(e) => setImageSourceUrl(e.target.value)}
                      onKeyDown={suppressEnterFormSubmit}
                      disabled={isAtImageLimit}
                      title={isAtImageLimit ? `已達 ${MAX_PRODUCT_IMAGES} 張上限` : undefined}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">本地端選擇圖片</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => setImageSourceFile(e.target.files?.[0] ?? null)}
                      onKeyDown={suppressEnterFormSubmit}
                      disabled={isAtImageLimit}
                      title={isAtImageLimit ? `已達 ${MAX_PRODUCT_IMAGES} 張上限` : undefined}
                    />
                  </div>
                  <div className="d-grid mb-3">
                    <button
                      type="button"
                      className="btn btn-dark"
                      onClick={handleUploadImage}
                      disabled={!isUploadReady || uploadingImage || isAtImageLimit}
                      title={
                        isAtImageLimit
                          ? `已達 ${MAX_PRODUCT_IMAGES} 張上限，請先刪除圖片`
                          : undefined
                      }
                    >
                      {uploadingImage ? "上傳中..." : "上傳圖片"}
                    </button>
                    {isAtImageLimit ? (
                      <p className="small text-danger mt-2 mb-0">
                        已達 {MAX_PRODUCT_IMAGES} 張上限（含主圖），請先刪除圖片後才能再上傳。
                      </p>
                    ) : (
                      <p className="small text-muted mt-2 mb-0">
                        主圖 + 副圖最多 {MAX_PRODUCT_IMAGES} 張（目前 {imageCount} 張）
                      </p>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="m-0">圖片清單</h6>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      disabled={selectedImageKeys.length === 0}
                      onClick={handleDeleteSelectedImages}
                    >
                      刪除勾選（{selectedImageKeys.length}）
                    </button>
                  </div>
                  <div className="border rounded p-2" style={{ maxHeight: 360, overflowY: "auto" }}>
                    {imageItems.length === 0 ? (
                      <div className="text-muted small py-2">尚未上傳圖片</div>
                    ) : (
                      imageItems.map((item) => (
                        <div key={item.key} className="d-flex align-items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={selectedImageKeys.includes(item.key)}
                            onChange={() => handleToggleImageSelect(item.key)}
                            onKeyDown={suppressEnterFormSubmit}
                          />
                          <img
                            src={item.url}
                            alt={item.label}
                            className="rounded border"
                            style={{ width: 72, height: 72, objectFit: "cover" }}
                          />
                          <div className="flex-grow-1">
                            <div className="small fw-semibold">{item.label}</div>
                            <div className="text-muted small text-truncate" style={{ maxWidth: 140 }}>
                              {item.url}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteSingleImage(item.key)}
                          >
                            刪除
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                取消
              </button>
              <button type="submit" className="btn btn-primary">
                確認
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
