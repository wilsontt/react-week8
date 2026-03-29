/**
 * 後台訂單 API 服務
 * 串接 ec-course-api.hexschool.io 後台訂單端點
 */
import axios from "axios";
import { getAdminAuthHeaders } from "../utils/adminSession";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const ADMIN_ORDER_BASE = `${VITE_API_BASE}/api/${VITE_API_PATH}/admin`;

/**
 * 取得訂單列表 (分頁)
 */
export async function getOrders(page = 1) {
  const { data } = await axios.get(`${ADMIN_ORDER_BASE}/orders?page=${page}`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 更新訂單 (如：修改付款狀態)
 * @param {string} id - 訂單 ID
 * @param {Object} payload - 訂單資料 { data: { ... } }
 */
export async function updateOrder(id, payload) {
  const { data } = await axios.put(
    `${ADMIN_ORDER_BASE}/order/${id}`,
    { data: payload },
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 刪除單一訂單
 * @param {string} id - 訂單 ID
 */
export async function deleteOrder(id) {
  const { data } = await axios.delete(`${ADMIN_ORDER_BASE}/order/${id}`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 刪除全部訂單
 */
export async function deleteAllOrders() {
  const { data } = await axios.delete(`${ADMIN_ORDER_BASE}/orders/all`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}
