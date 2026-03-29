import axios from "axios";

/** 後台管理員 Cookie 名稱（與 Login 寫入一致） */
export const ADMIN_TOKEN_COOKIE_NAME = "hexToken";

const COOKIE_PREFIX = `${ADMIN_TOKEN_COOKIE_NAME}=`;

/**
 * 從 document.cookie 讀取後台 hexToken。
 * @returns {string} 無則回傳空字串
 */
export function getAdminTokenFromCookie() {
  const row = document.cookie.split("; ").find((r) => r.startsWith(COOKIE_PREFIX));
  if (!row) return "";
  const raw = row.slice(COOKIE_PREFIX.length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * 依 Cookie 同步 axios Authorization（必須在首次 render 前或與 isAuth 同時執行，避免子元件先打 API 無帶 Token）。
 * @returns {boolean} 是否視為已登入（有有效 token）
 */
export function applyAdminSessionFromCookie() {
  const token = getAdminTokenFromCookie();
  if (token) {
    axios.defaults.headers.common.Authorization = token;
    return true;
  }
  delete axios.defaults.headers.common.Authorization;
  return false;
}

/**
 * 登出：清除 Cookie（path 需與寫入時一致）與 axios 預設標頭。
 */
export function clearAdminSession() {
  document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  delete axios.defaults.headers.common.Authorization;
}

/**
 * 供各 API 模組帶入 Authorization（正確處理 JWT 內含 `=` 與 encodeURIComponent 還原）。
 * @returns {Record<string, string>}
 */
export function getAdminAuthHeaders() {
  const token = getAdminTokenFromCookie();
  return token ? { Authorization: token } : {};
}
