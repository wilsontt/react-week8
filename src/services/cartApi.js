/**
 * 購物車 API 服務
 * 串接 ec-course-api.hexschool.io 購物車端點
 */
import axios from "axios";
import { getAdminAuthHeaders } from "../utils/adminSession";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const CART_BASE = `${VITE_API_BASE}/api/${VITE_API_PATH}/cart`;

/**
 * 取得購物車列表
 * @returns {Promise<{data: {carts: Array}}>}
 */
export async function getCart() {
  const { data } = await axios.get(CART_BASE, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 加入購物車
 * @param {string} productId - 產品 ID
 * @param {number} qty - 數量
 */
export async function addToCart(productId, qty = 1) {
  const { data } = await axios.post(
    CART_BASE,
    { data: { product_id: productId, qty } },
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 更新購物車項目數量
 * @param {string} cartId - 購物車項目 ID
 * @param {number} qty - 新數量
 * @param {string} [productId] - 產品 ID（部分 API 需一併傳送）
 */
export async function updateCartItem(cartId, qty, productId) {
  const body = productId ? { data: { product_id: productId, qty } } : { data: { qty } };
  const { data } = await axios.put(
    `${CART_BASE}/${cartId}`,
    body,
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 刪除單一購物車項目
 * @param {string} cartId - 購物車項目 ID
 */
export async function removeCartItem(cartId) {
  const { data } = await axios.delete(`${CART_BASE}/${cartId}`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 清空購物車
 */
export async function clearCart() {
  const { data } = await axios.delete(`${CART_BASE}s`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}
