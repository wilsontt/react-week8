/**
 * 後台管理 - 客戶訂單管理頁面
 */
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FaEye, FaTrash, FaClipboardList } from "react-icons/fa";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";
import "../../pages/cart.css";
import "../admin-list-layout.css";
import Pagination from "../../components/common/Pagination";
import DataTable, { DataTableIconButton } from "../../components/common/DataTable";
import OrderModal from "../components/OrderModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import * as adminOrderApi from "../../services/adminOrderApi";
import { showNotification } from "../../slices/notificationSlice";
import { getListItemNo } from "../../utils/listUtils";
import MoneyAmount from "../../components/common/MoneyAmount";
import ListLoadingOverlay from "../../components/common/ListLoadingOverlay";

export default function OrderList() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total_pages: 0,
    current_page: 1,
    has_pre: false,
    has_next: false,
  });
  const [loading, setLoading] = useState(true);

  // Modal 狀態
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminOrderApi.getOrders(page);
      setOrders(res?.orders ?? []);
      const pag = res?.pagination ?? {
        total_pages: 1,
        current_page: 1,
        has_pre: false,
        has_next: false,
      };
      setPagination(pag);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "取得訂單列表失敗" }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination.total_pages || 1)) {
      fetchOrders(page);
    }
  };

  // 開啟檢視 Modal
  const handleOpenView = (order) => {
    setCurrentOrder(order);
    setShowOrderModal(true);
  };

  // 開啟刪除 Modal
  const handleOpenDelete = (order) => {
    setCurrentOrder(order);
    setShowDeleteModal(true);
  };

  // 儲存訂單變更 (如：付款狀態)
  const handleSaveOrder = async (payload) => {
    try {
      await adminOrderApi.updateOrder(payload.id, payload);
      dispatch(showNotification({ type: "success", message: "更新訂單成功" }));
      setShowOrderModal(false);
      await fetchOrders(pagination.current_page);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "更新訂單失敗" }));
    }
  };

  // 刪除訂單
  const handleDeleteOrder = async () => {
    if (!currentOrder) return;
    try {
      await adminOrderApi.deleteOrder(currentOrder.id);
      dispatch(showNotification({ type: "success", message: "刪除訂單成功" }));
      setShowDeleteModal(false);
      await fetchOrders(pagination.current_page);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "刪除訂單失敗" }));
    }
  };

  // 刪除全部訂單
  const handleDeleteAllOrders = async () => {
    if (!window.confirm("確定要刪除「所有」訂單嗎？此動作無法復原！")) return;
    try {
      await adminOrderApi.deleteAllOrders();
      dispatch(showNotification({ type: "success", message: "已刪除所有訂單" }));
      await fetchOrders(1);
    } catch (err) {
      dispatch(showNotification({ type: "error", message: err?.response?.data?.message ?? "刪除所有訂單失敗" }));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    return new Date(timestamp * 1000).toLocaleDateString();
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
      key: "create_at",
      label: "下單時間",
      style: { width: "120px" },
      render: (item) => formatDate(item.create_at),
    },
    {
      key: "id",
      label: "訂單編號",
      tdClassName: "text-break",
      render: (item) => <span className="text-muted small text-break d-inline-block">{item.id}</span>,
    },
    {
      key: "email",
      label: "聯絡信箱",
      tdClassName: "text-break",
      style: { minWidth: "11rem" },
      render: (item) => <div className="text-muted small text-break">{item.user?.email}</div>,
    },
    {
      key: "total",
      label: "訂單金額",
      thClassName: "text-end",
      tdClassName: "text-end fw-medium",
      style: { width: "150px" },
      render: (item) => <MoneyAmount value={Math.round(item.total)} total />,
    },
    {
      key: "is_paid",
      label: "付款狀態",
      thClassName: "text-center",
      tdClassName: "text-center",
      style: { width: "120px" },
      render: (item) =>
        item.is_paid ? (
          <span className="badge bg-success">已付款</span>
        ) : (
          <span className="badge bg-danger">未付款</span>
        ),
    },
    {
      key: "actions",
      label: "操作",
      thClassName: "text-center",
      tdClassName: "text-center",
      style: { width: "120px" },
      render: (item) => (
        <div className="d-flex gap-1 align-items-center justify-content-center flex-wrap">
          <DataTableIconButton
            variant="primary"
            ariaLabel={`檢視或編輯訂單 ${item.id ?? ""}`}
            title="檢視／編輯"
            onClick={() => handleOpenView(item)}
          >
            <FaEye size={14} />
          </DataTableIconButton>
          <DataTableIconButton
            variant="danger"
            ariaLabel={`刪除訂單 ${item.id ?? ""}`}
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
            <FaClipboardList className="text-success" size={28} aria-hidden />
            客戶訂單管理
          </h2>
          {orders.length > 0 && (
            <button type="button" className="btn btn-outline-danger px-4 flex-shrink-0" onClick={handleDeleteAllOrders}>
              清除所有訂單
            </button>
          )}
        </div>

        <div className="cart-page__list-wrap position-relative overflow-hidden">
          <ListLoadingOverlay show={loading} message="載入訂單列表…" />
          <div className="cart-page__list-header">
            <h3 className="cart-page__list-title">訂單列表</h3>
          </div>
          <DataTable
            columns={columns}
            data={orders}
            loading={false}
            emptyState={
              <>
                <div className="text-muted mb-3">目前沒有訂單唷</div>
                <button
                  type="button"
                  className="btn btn-outline-dark rounded-0 px-4"
                  onClick={() => (window.location.href = "/productList")}
                >
                  回到產品列表
                </button>
              </>
            }
          />
        </div>
        {pagination.total_pages > 1 && (
          <div className="mt-3">
            <Pagination pagination={pagination} onChangePage={handlePageChange} />
          </div>
        )}
      </div>

      <OrderModal
        key={
          showOrderModal && currentOrder
            ? String(currentOrder.id)
            : "order-modal-closed"
        }
        show={showOrderModal}
        order={currentOrder}
        onClose={() => setShowOrderModal(false)}
        onSave={handleSaveOrder}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        title="刪除訂單"
        message={`確定要刪除訂單「${currentOrder?.id}」嗎？`}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteOrder}
      />
    </PageWithLogoBg>
  );
}
