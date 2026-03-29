/**
 * 計算清單跨頁連續 ITEM 水號
 * @param {Object} pagination - 分頁資料
 * @param {number} index - 當前頁 0-based 索引
 * @returns {number}
 */
export function getListItemNo(pagination, index) {
  const perPage = Number(pagination?.per_page ?? 10);
  const currentPage = Number(pagination?.current_page ?? 1);
  return (currentPage - 1) * perPage + index + 1;
}
