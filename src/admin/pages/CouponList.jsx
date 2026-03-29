/**
 * 後台管理 - 優惠券管理
 * 列表、新增、編輯、刪除、啟用切換
 */
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FaPlus, FaEdit, FaTrash, FaTicketAlt } from "react-icons/fa";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";
import "../../pages/Cart.css";
import "../AdminListLayout.css";
import Pagination from "../../components/common/Pagination";
import DataTable, { DataTableIconButton } from "../../components/common/DataTable";
import CouponFormModal from "../components/CouponFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import * as couponApi from "../../services/couponApi";
import { showNotification } from "../../slices/notificationSlice";
import { getListItemNo } from "../../utils/listUtils";

export default function CouponList() {
  const dispatch = useDispatch();
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({
    total_pages: 0,
    current_page: 1,
    has_pre: false,
    has_next: false,
  });
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCoupons = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await couponApi.getCoupons(page);
      const list = res?.data?.coupons ?? res?.coupons ?? [];
      const pag = res?.data?.pagination ?? res?.pagination ?? {
        total_pages: 1,
        current_page: 1,
        has_pre: false,
        has_next: false,
      };
      setCoupons(Array.isArray(list) ? list : []);
      setPagination(pag);
    } catch (err) {
      console.error("取得優惠券失敗：", err);
      dispatch(showNotification({ type: "error", message: "取得優惠券失敗" }));
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCoupons(1);
  }, [fetchCoupons]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination.total_pages || 1)) {
      fetchCoupons(page);
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingCoupon(null);
    setModalShow(true);
  };

  const handleOpenEdit = (coupon) => {
    setModalMode("edit");
    setEditingCoupon(coupon);
    setModalShow(true);
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setEditingCoupon(null);
  };

  const handleSave = async (payload) => {
    try {
      if (modalMode === "edit" && editingCoupon?.id) {
        await couponApi.updateCoupon(editingCoupon.id, payload);
        dispatch(showNotification({ type: "success", message: "已更新優惠券" }));
      } else {
        await couponApi.createCoupon(payload);
        dispatch(showNotification({ type: "success", message: "已新增優惠券" }));
      }
      await fetchCoupons(pagination.current_page);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "儲存失敗";
      dispatch(showNotification({ type: "error", message: msg }));
    }
  };

  const handleDeleteClick = (coupon) => {
    setDeleteConfirm(coupon);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await couponApi.deleteCoupon(deleteConfirm.id);
      dispatch(showNotification({ type: "success", message: "已刪除優惠券" }));
      setDeleteConfirm(null);
      await fetchCoupons(pagination.current_page);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "刪除失敗";
      dispatch(showNotification({ type: "error", message: msg }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleToggleEnabled = async (coupon) => {
    try {
      const newEnabled = coupon.is_enabled ? 0 : 1;
      await couponApi.updateCoupon(coupon.id, {
        title: coupon.title,
        code: coupon.code,
        percent: coupon.percent,
        due_date: coupon.due_date,
        is_enabled: newEnabled,
      });
      dispatch(showNotification({ type: "success", message: "已更新啟用狀態" }));
      await fetchCoupons(pagination.current_page);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "更新失敗";
      dispatch(showNotification({ type: "error", message: msg }));
    }
  };

  const formatDate = (val) => {
    if (!val) return "—";
    const d = new Date(val * 1000);
    return Number.isNaN(d.getTime()) ? val : d.toISOString().slice(0, 10);
  };

  const columns = [
    {
      key: "item_no",
      label: "ITEM",
      thClassName: "text-center",
      tdClassName: "text-center",
      style: { width: "80px" },
      render: (_item, index) => getListItemNo(pagination, index),
    },
    {
      key: "title",
      label: "優惠券標題",
      tdClassName: "text-break",
      style: { minWidth: "9rem" },
      render: (item) => item.title ?? "—",
    },
    {
      key: "code",
      label: "優惠碼",
      tdClassName: "font-monospace small text-break",
      style: { minWidth: "7rem" },
      render: (item) => item.code ?? "—",
    },
    { key: "percent", label: "折扣", render: (item) => `${item.percent ?? 0} %` },
    { key: "due_date", label: "截止日", render: (item) => formatDate(item.due_date) },
    {
      key: "is_enabled",
      label: "啟用",
      render: (item) => (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            role="switch"
            checked={Boolean(item.is_enabled)}
            onChange={() => handleToggleEnabled(item)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "操作",
      style: { width: 140 },
      render: (item) => (
        <div className="d-flex gap-1 align-items-center flex-wrap">
          <DataTableIconButton
            variant="dark"
            ariaLabel={`編輯優惠券：${item.title ?? item.code ?? ""}`}
            title="編輯"
            onClick={() => handleOpenEdit(item)}
          >
            <FaEdit size={14} />
          </DataTableIconButton>
          <DataTableIconButton
            variant="danger"
            ariaLabel={`刪除優惠券：${item.title ?? item.code ?? ""}`}
            title="刪除"
            onClick={() => handleDeleteClick(item)}
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
            <FaTicketAlt className="text-success" size={28} aria-hidden />
            優惠券管理
          </h2>
          <button
            type="button"
            className="cart-page__btn-checkout d-inline-flex align-items-center justify-content-center gap-2"
            onClick={handleOpenAdd}
          >
            <FaPlus size={18} aria-hidden />
            新增優惠券
          </button>
        </div>

        <div className="cart-page__list-wrap">
          <div className="cart-page__list-header">
            <h3 className="cart-page__list-title">優惠券列表</h3>
          </div>
          <DataTable
            columns={columns}
            data={coupons}
            loading={loading}
            emptyState="尚無優惠券，點擊「新增優惠券」建立"
          />
        </div>
        {coupons.length > 0 && pagination.total_pages > 1 && (
          <div className="mt-3">
            <Pagination pagination={pagination} onChangePage={handlePageChange} />
          </div>
        )}
      </div>

      <CouponFormModal
        show={modalShow}
        mode={modalMode}
        initialData={editingCoupon}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        show={!!deleteConfirm}
        title={deleteConfirm?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </PageWithLogoBg>
  );
}
