/**
 * 後台管理 - 產品列表管理
 */
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FaPlus, FaEdit, FaTrash, FaBoxes } from "react-icons/fa";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";
import "../../pages/Cart.css";
import "../AdminListLayout.css";
import Pagination from "../../components/common/Pagination";
import DataTable, { DataTableIconButton } from "../../components/common/DataTable";
import ProductFormModal from "../components/ProductFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import * as adminProductApi from "../../services/adminProductApi";
import { showNotification } from "../../slices/notificationSlice";
import { getListItemNo } from "../../utils/listUtils";
import MoneyAmount from "../../components/common/MoneyAmount";

export default function Products() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total_pages: 0,
    current_page: 1,
    has_pre: false,
    has_next: false,
  });
  const [loading, setLoading] = useState(false);

  // Modal 狀態
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [currentProduct, setCurrentProduct] = useState(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminProductApi.getProducts(page);
      setProducts(res?.products ?? []);
      const pag = res?.pagination ?? {
        total_pages: 1,
        current_page: 1,
        has_pre: false,
        has_next: false,
      };
      setPagination(pag);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "取得產品列表失敗" }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination.total_pages || 1)) {
      fetchProducts(page);
    }
  };

  // 開啟新增 Modal
  const handleOpenAdd = () => {
    setModalMode("add");
    setCurrentProduct(null);
    setShowFormModal(true);
  };

  // 開啟編輯 Modal
  const handleOpenEdit = (product) => {
    setModalMode("edit");
    setCurrentProduct(product);
    setShowFormModal(true);
  };

  // 開啟刪除 Modal
  const handleOpenDelete = (product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  // 儲存產品 (新增/編輯)
  const handleSaveProduct = async (payload) => {
    try {
      if (modalMode === "add") {
        await adminProductApi.createProduct(payload);
        dispatch(showNotification({ type: "success", message: "新增產品成功" }));
      } else {
        await adminProductApi.updateProduct(currentProduct.id, payload);
        dispatch(showNotification({ type: "success", message: "更新產品成功" }));
      }
      setShowFormModal(false);
      await fetchProducts(pagination.current_page);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "儲存產品失敗" }));
    }
  };

  // 刪除產品
  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    try {
      await adminProductApi.deleteProduct(currentProduct.id);
      dispatch(showNotification({ type: "success", message: "刪除產品成功" }));
      setShowDeleteModal(false);
      await fetchProducts(pagination.current_page);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "刪除產品失敗" }));
    }
  };

  // 切換啟用狀態
  const handleToggleEnable = async (product) => {
    try {
      const payload = { ...product, is_enabled: product.is_enabled ? 0 : 1 };
      await adminProductApi.updateProduct(product.id, payload);
      dispatch(showNotification({ type: "success", message: "更新啟用狀態成功" }));
      await fetchProducts(pagination.current_page);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "更新狀態失敗" }));
    }
  };

  // 定義 產品列表的表格欄位 及 自訂渲染函數
  const columns = [
    {
      key: "item_no",
      label: "ITEM",
      thClassName: "text-center",
      tdClassName: "text-center",
      style: { width: "80px" },
      render: (_item, index) => getListItemNo(pagination, index),
    },
    { key: "category", label: "分類", style: { width: "120px" } },
    { key: "title", label: "產品名稱", tdClassName: "text-break", style: { minWidth: "10rem" } },
    {
      key: "origin_price",
      label: "原價",
      thClassName: "text-end",
      tdClassName: "text-end",
      style: { width: "120px" },
      render: (item) => <MoneyAmount value={item.origin_price} />,
    },
    {
      key: "price",
      label: "售價",
      thClassName: "text-end",
      tdClassName: "text-end",
      style: { width: "120px" },
      render: (item) => <MoneyAmount value={item.price} total className="fw-semibold" />,
    },
    {
      key: "is_enabled",
      label: "是否啟用",
      thClassName: "text-center",
      tdClassName: "text-center",
      style: { width: "100px" },
      render: (item) => (
        <div className="form-check form-switch d-flex justify-content-center m-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={Boolean(item.is_enabled)}
            onChange={() => handleToggleEnable(item)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "編輯",
      thClassName: "text-center",
      tdClassName: "text-center",
      style: { width: "120px" },
      render: (item) => (
        <div className="d-flex gap-1 align-items-center justify-content-center flex-wrap">
          <DataTableIconButton
            variant="dark"
            ariaLabel={`編輯產品：${item.title ?? ""}`}
            title="編輯"
            onClick={() => handleOpenEdit(item)}
          >
            <FaEdit size={14} />
          </DataTableIconButton>
          <DataTableIconButton
            variant="danger"
            ariaLabel={`刪除產品：${item.title ?? ""}`}
            title="刪除"
            onClick={() => handleOpenDelete(item)}
          >
            <FaTrash size={14} />
          </DataTableIconButton>
        </div>
      ),
    },
  ];

  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <div className="container py-4 cart-page admin-store-layout">
        <div className="admin-store-layout__title-row d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <h2 className="mb-0 d-flex align-items-center gap-2 text-start">
            <FaBoxes className="text-success" size={28} aria-hidden />
            產品列表管理
          </h2>
          <button
            type="button"
            className="cart-page__btn-checkout d-inline-flex align-items-center justify-content-center gap-2"
            onClick={handleOpenAdd}
          >
            <FaPlus aria-hidden />
            新增產品
          </button>
        </div>

        <div className="cart-page__list-wrap">
          <div className="cart-page__list-header">
            <h3 className="cart-page__list-title">產品列表</h3>
          </div>
          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            emptyState={<div className="text-muted">目前沒有產品</div>}
          />
        </div>
        {pagination.total_pages > 1 && (
          <div className="mt-3">
            <Pagination pagination={pagination} onChangePage={handlePageChange} />
          </div>
        )}
      </div>

      <ProductFormModal
        show={showFormModal}
        mode={modalMode}
        initialData={currentProduct}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveProduct}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        title="刪除產品"
        message={`確定要刪除產品「${currentProduct?.title}」嗎？`}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProduct}
      />
    </PageWithLogoBg>
  );
}
