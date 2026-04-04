// 產品列表頁面
// - 單一頁面，分類篩選在左側區塊
// - 分類按鈕由產品 category 欄位動態產生，零硬編碼
// - API 分頁：每頁最多 10 筆
// 
import { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { FaEye, FaListUl, FaRegStar, FaStar } from "react-icons/fa";

import PageWithLogoBg from "../components/common/PageWithLogoBg";
import { addToCart } from "../slices/cartSlice";
import { showNotification } from "../slices/notificationSlice";
import Pagination from "../components/common/Pagination";
import ProductDetailCard from "../components/common/ProductDetailCard";
import MoneyAmount from "../components/common/MoneyAmount";
// 共用清單水號工具：支援分頁後的連續編號
import { getListItemNo } from "../utils/listUtils";
import ListLoadingOverlay from "../components/common/ListLoadingOverlay";

const { VITE_API_BASE, VITE_API_PATH } = import.meta.env;
const ALL_CATEGORY = "全部產品";

export default function ProductList() {
  const dispatch = useDispatch();

  // 產品列表，用於顯示產品列表。
  const [products, setProducts] = useState([]);
  // 分頁資料，用於顯示產品列表。
  const [pagination, setPagination] = useState({ total_pages: 0, current_page: 1, has_pre: false, has_next: false });
  // 選取到的分類，用於顯示產品列表。null 時顯示全部商品。
  const [selectedCategory, setSelectedCategory] = useState(null);
  // 選取到的商品，用於顯示產品明細卡片模態視窗。null 時不渲染。
  const [selectedProduct, setSelectedProduct] = useState(null);
  /** 列表 API 請求中（首屏與換頁／換分類） */
  const [listLoading, setListLoading] = useState(true);

  // 取得產品資料：page 與 category 變更時皆需重新 fetch
  const getProducts = useCallback(async (page = 1, category = null) => {
    setListLoading(true);
    try {
      let url = `${VITE_API_BASE}/api/${VITE_API_PATH}/products?page=${page}`;
      if (category && category !== ALL_CATEGORY) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const response = await axios.get(url);
      setProducts(response.data?.products ?? []);
      setPagination(response.data?.pagination ?? { total_pages: 0, current_page: 1, has_pre: false, has_next: false });

      // 切換分頁後捲回列表頂部，避免停在分頁區
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      dispatch(
        showNotification({
          type: "error",
          message: error?.response?.data?.message ?? "取得產品資料失敗，請稍後再試",
        })
      );
      setProducts([]);
    } finally {
      setListLoading(false);
    }
  }, [dispatch]);

  // 初始載入：預設全部商品、第 1 頁，避免初始 API 取得產品為標準模式 
  useEffect(() => {
    getProducts(1, null);
  }, [getProducts]);

  // 分類切換：點擊分類或全部商品時重新 fetch 第 1 頁
  const handleCategoryClick = (cat) => {
    const category = cat === ALL_CATEGORY ? null : cat;
    setSelectedCategory(category);
    getProducts(1, category);
  };

  // 分頁切換：fetch 指定頁，帶入目前分類
  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination.total_pages || 1)) {
      getProducts(page, selectedCategory ?? null);
    }
  };

  // 從產品資料動態萃取分類（需先 fetch 一筆取得 categories，或由 API 提供）
  const categories = useMemo(() => {
    const list = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();
    return [ALL_CATEGORY, ...list];
  }, [products]);

  const displayProducts = products;
  const activeCategory = selectedCategory ?? ALL_CATEGORY;
  const totalCount = pagination.total ?? displayProducts.length;


  /** 關閉 Modal：使用 useCallback 避免 ProductDetailCard useEffect 重跑導致閃爍 */
  const handleCloseModal = useCallback(() => setSelectedProduct(null), []);

  /** 加入購物車：成功/失敗皆顯示通知 */
  const handleAddToCart = useCallback(
    async (product, qty) => {
      const productId = product?.id ?? product;
      if (!productId) throw new Error("缺少產品 ID");
      try {
        await dispatch(addToCart({ productId, qty })).unwrap();
        dispatch(showNotification({ type: "success", message: "已加入購物車" }));
      } catch (err) {
        dispatch(showNotification({ type: "error", message: err?.message ?? "加入購物車失敗" }));
        throw err;
      }
    },
    [dispatch]
  );

  // openModal 函數，用於開啟產品明細卡片模態視窗
  const openModal = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
      setTimeout(() => setSelectedProduct(product), 0);
    } else {
      setSelectedProduct(product);
    }
  };

  
  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <div className="container-fluid py-3 border border-1 rounded shadow-sm position-relative overflow-hidden" style={{ minHeight: "280px" }}>
        <ListLoadingOverlay show={listLoading} message="載入產品中…" />
        <div className={`row g-3 ${listLoading ? "opacity-0" : ""}`} style={listLoading ? { pointerEvents: "none" } : undefined} aria-hidden={listLoading}>
          {/* 左側：產品分類 */}
          <aside className="col-md-3 col-lg-2">
            <div className="card">
              <div className="card-header fw-bold">產品分類</div>
              <div className="card-body p-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`btn btn-sm w-100 text-start mb-1 ${activeCategory === cat ? "btn-warning" : "btn-outline-secondary"}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 右側：產品網格 */}
          <main className="col-md-9 col-lg-10">
            <h3 className="mb-1"><FaListUl className="text-warning me-2" size={24} />產品列表</h3>
            <p className="text-muted mb-1">
              共 {totalCount} 項{activeCategory !== ALL_CATEGORY ? ` ${activeCategory}` : ""} 商品
            </p>
            {/* 卡片間距：改 row 的 g-2 / g-3 / g-4 / g-5（愈大間距愈寬） */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
              {displayProducts.length === 0 ? (
                <div className="w-100 text-muted py-5">目前沒有符合條件的商品</div>
              ) : (
                // index 搭配 pagination 計算跨頁連續水號
                displayProducts.map((item, index) => (
                  <div key={item.id} className="col">
                    <div className="card h-100 border border-1 border-primary rounded-2 text-center">
                      <div className="card-body d-flex flex-column">
                        <div
                          className="rounded px-0 py-0 mb-0 overflow-hidden text-center position-relative"
                          style={{ height: "300px", backgroundColor: "#f8f9fa" }}
                        >
                          {/* 圖片左上角圈圈數字（ITEM 水號） */}
                          <span
                            className="position-absolute top-0 start-0 badge rounded-circle bg-dark text-white d-flex align-items-center justify-content-center"
                            style={{ width: 28, height: 28, fontSize: 12, zIndex: 3, marginTop: 6, marginLeft: 6 }}
                          >
                            {getListItemNo(pagination, index)}
                          </span>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              className="rounded"
                              alt={item.title}
                            />
                          ) : (
                            <div className="rounded d-flex align-items-center justify-content-center h-100 text-muted small" aria-hidden>
                              無圖片
                            </div>
                          )}
                        </div>
                        <div className="h4 text-left text-dark">
                          {item.title}
                          <small className="fs-6 fw-light bg-secondary text-white px-1 py-0 rounded-pill">{item.category}</small>
                        </div>
                        <div className="mt-0 gap-2 text-start">{item.description}</div>
                        <div className="d-flex justify-content-between align-items-left mt-0 gap-2 flex-wrap">
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="text-muted small">價格</span>
                            <span className="text-decoration-line-through opacity-75">
                              <MoneyAmount value={Number(item.origin_price)} />
                            </span>
                            <MoneyAmount value={Number(item.price)} className="text-danger fw-semibold" />
                          </div>
                          <div className="col-3 text-left">單位：{item.unit}</div>
                          <div className="col-3 text-left d-flex align-items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) =>
                              i <= (item.rating ?? 0) ? (
                                <FaStar key={i} className="text-warning" size={18} />
                              ) : (
                                <FaRegStar key={i} className="text-secondary" size={18} />
                              )
                            )}
                          </div>
                        </div>
                        <button type="button" className="btn btn-outline-primary mt-3"
                          onClick={() => openModal(item.id)}>
                          <FaEye className="md-2 text-warning" size={24} />查看明細
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* 分頁元件, 傳入分頁資料及分頁變更事件處理函數 */}
            <br />
            <Pagination pagination={pagination} onChangePage={handlePageChange} />
            {/* 產品明細卡片模態視窗 */}
            <ProductDetailCard
              selectedProduct={selectedProduct}
              onClose={handleCloseModal}
              onAddToCart={handleAddToCart}
            />
          </main>
        </div>
      </div>
    </PageWithLogoBg>
  );
}
