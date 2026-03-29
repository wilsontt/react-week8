/**
 * 優惠券 API 服務
 * 串接 ec-course-api.hexschool.io 優惠券端點
 */
import axios from "axios";
import { getAdminAuthHeaders } from "../utils/adminSession";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

/** 與購物車、訂單相同前綴（非 admin） */
const API_ROOT = `${VITE_API_BASE}/api/${VITE_API_PATH}`;
const COUPON_BASE = `${API_ROOT}/admin`;

/**
 * 取得優惠券列表
 */
export async function getCoupons(page = 1) {
  const { data } = await axios.get(`${COUPON_BASE}/coupons?page=${page}`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 新增優惠券
 * @param {Object} payload - { title, code, percent, due_date, is_enabled }
 */
export async function createCoupon(payload) {
  const { data } = await axios.post(
    `${COUPON_BASE}/coupon`,
    { data: payload },
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 更新優惠券
 * @param {string} id - 優惠券 ID
 * @param {Object} payload - { title, code, percent, due_date, is_enabled }
 */
export async function updateCoupon(id, payload) {
  const { data } = await axios.put(
    `${COUPON_BASE}/coupon/${id}`,
    { data: payload },
    { headers: getAdminAuthHeaders() }
  );
  return data;
}

/**
 * 刪除優惠券
 */
export async function deleteCoupon(id) {
  const { data } = await axios.delete(`${COUPON_BASE}/coupon/${id}`, {
    headers: getAdminAuthHeaders(),
  });
  return data;
}

/**
 * 前台驗證優惠碼（客戶端 API，不需後台登入）
 * @see https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E5%AE%A2%E6%88%B6%E8%B3%BC%E7%89%A9%20-%20%E5%84%AA%E6%83%A0%E5%88%B8%20(Coupon) ec-courses：成功時 `data.final_total`
 * @see https://hexschool.github.io/vue3-courses-swaggerDoc/ 客戶購物 - 優惠券 POST（vue3 文件）
 * @param {string} code - 使用者輸入之優惠碼（會 trim）
 * @returns {Promise<Record<string, unknown>>} API 原始 JSON（含 success、message、data / coupon 等）
 */
export async function validateCustomerCouponCode(code) {
  const trimmed = String(code ?? "").trim();
  const { data } = await axios.post(
    `${API_ROOT}/coupon`,
    { data: { code: trimmed } }
  );
  return data;
}

/**
 * 取得所有分頁之優惠券列表（僅後台管理；需 admin Token）
 * @param {number} [maxPages] - 安全上限，避免異常分頁迴圈
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function fetchAllCoupons(maxPages = 50) {
  const all = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= maxPages) {
    const res = await getCoupons(page);
    const list = res?.data?.coupons ?? res?.coupons ?? [];
    if (!Array.isArray(list)) {
      break;
    }
    all.push(...list);
    const pag = res?.data?.pagination ?? res?.pagination ?? {};
    hasNext = Boolean(pag.has_next);
    page += 1;
  }

  return all;
}
