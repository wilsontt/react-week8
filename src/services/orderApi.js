/**
 * 訂單 API 服務
 * 串接 ec-course-api.hexschool.io 結帳與付款端點
 */
import axios from "axios";
import { getAdminAuthHeaders } from "../utils/adminSession";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const ORDER_BASE = `${VITE_API_BASE}/api/${VITE_API_PATH}`;

/**
 * 建立訂單
 * @param {Object} user - { name, email, tel, address }
 * @param {string} [message] - 留言（選填）
 * @param {string|null} [couponCode] - 優惠碼（選填；與後台優惠券 code 一致時由 API 套用折扣）
 */
export async function createOrder(user, message = "", couponCode = null) {
  const payload = {
    user: {
      name: user.name,
      email: user.email,
      tel: user.tel,
      address: user.address,
    },
    message: message || "",
  };
  const trimmed = couponCode != null ? String(couponCode).trim() : "";
  if (trimmed) {
    payload.code = trimmed;
  }
  const { data } = await axios.post(
    `${ORDER_BASE}/order`,
    { data: payload },
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 付款
 * @param {string} orderId - 訂單 ID
 */
export async function payOrder(orderId) {
  const { data } = await axios.post(
    `${ORDER_BASE}/pay/${orderId}`,
    {},
    { headers: getAdminAuthHeaders() }
  );
  return data;
}
