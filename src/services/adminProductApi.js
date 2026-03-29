/**
 * 後台產品 API 服務
 * 串接 ec-course-api.hexschool.io 後台產品端點
 */
import axios from "axios";
import { getAdminAuthHeaders } from "../utils/adminSession";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const ADMIN_PRODUCT_BASE = `${VITE_API_BASE}/api/${VITE_API_PATH}/admin`;

/**
 * 取得產品列表 (分頁)
 */
export async function getProducts(page = 1) {
  const { data } = await axios.get(`${ADMIN_PRODUCT_BASE}/products?page=${page}`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 取得所有產品 (不分頁)
 */
export async function getAllProducts() {
  const { data } = await axios.get(`${ADMIN_PRODUCT_BASE}/products/all`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 新增產品
 * @param {Object} payload - 產品資料
 */
export async function createProduct(payload) {
  const { data } = await axios.post(
    `${ADMIN_PRODUCT_BASE}/product`,
    { data: payload },
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 更新產品
 * @param {string} id - 產品 ID
 * @param {Object} payload - 產品資料
 */
export async function updateProduct(id, payload) {
  const { data } = await axios.put(
    `${ADMIN_PRODUCT_BASE}/product/${id}`,
    { data: payload },
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 刪除產品
 * @param {string} id - 產品 ID
 */
export async function deleteProduct(id) {
  const { data } = await axios.delete(`${ADMIN_PRODUCT_BASE}/product/${id}`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 上傳圖片（本地檔案）
 * @param {File} file - 圖片檔案
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file-to-upload", file);
  const { data } = await axios.post(
    `${ADMIN_PRODUCT_BASE}/upload`,
    formData,
    {
      headers: {
        ...getAdminAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}
