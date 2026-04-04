/**
 * 前台產品 API（無需管理員 Token）
 */
import axios from "axios";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;

const PRODUCTS_URL = `${VITE_API_BASE}/api/${VITE_API_PATH}/products`;

/**
 * 取得前台產品第 1 頁（不帶 category）
 * @returns {Promise<{ products: Array, pagination: Record<string, unknown> }>}
 */
export async function getPublicProductsFirstPage() {
  const { data } = await axios.get(`${PRODUCTS_URL}?page=1`);
  return {
    products: data?.products ?? [],
    pagination: data?.pagination ?? {},
  };
}

/**
 * 取得第 2 頁起至最末頁之產品並合併為一陣列（需搭配第 1 頁回傳的 total_pages）
 * @param {number} totalPages - 總頁數（含第 1 頁）
 * @returns {Promise<Array>}
 */
export async function fetchRemainingPublicProductPages(totalPages) {
  const n = Math.max(1, Number(totalPages) || 1);
  if (n <= 1) return [];

  const pages = await Promise.all(
    Array.from({ length: n - 1 }, (_, i) => axios.get(`${PRODUCTS_URL}?page=${i + 2}`))
  );
  const out = [];
  pages.forEach((res) => {
    out.push(...(res.data?.products ?? []));
  });
  return out;
}

/**
 * 取得全部產品（合併所有分頁），供首頁主打區等使用
 * @returns {Promise<Array>}
 */
export async function getAllPublicProducts() {
  const { products, pagination } = await getPublicProductsFirstPage();
  const totalPages = Math.max(1, Number(pagination?.total_pages) || 1);
  if (totalPages <= 1) return [...products];
  const rest = await fetchRemainingPublicProductPages(totalPages);
  return [...products, ...rest];
}
