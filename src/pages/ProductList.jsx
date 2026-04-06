// 產品列表頁面
// - 右側：進頁先顯示第 1 頁 API 資料；背景靜默合併其餘頁後，篩選與分頁以全量資料於前端計算
// - 左側：全量合併完成前顯示「載入分類中…」與區塊內 spinner（不另開視窗）
// - 類別清單固定顯示全部（合併完成後）；選中 btn-success、未選 btn-outline-success（對齊首頁優惠 CTA，避免 outline + .active 與 :hover 衝突）
//
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { FaEye, FaListUl, FaRegStar, FaStar } from "react-icons/fa";

import PageWithLogoBg from "../components/common/PageWithLogoBg";
import { addToCart } from "../slices/cartSlice";
import { showNotification } from "../slices/notificationSlice";
import Pagination from "../components/common/Pagination";
import ProductDetailCard from "../components/common/ProductDetailCard";
import MoneyAmount from "../components/common/MoneyAmount";
import { getListItemNo } from "../utils/listUtils";
import ListLoadingOverlay from "../components/common/ListLoadingOverlay";
import "../components/common/card-accent-green.css";
import {
  getPublicProductsFirstPage,
  fetchRemainingPublicProductPages,
} from "../services/productApi";

const ALL_CATEGORY = "全部產品";
const DEFAULT_PER_PAGE = 10;

/**
 * 由全量產品萃取排序後的類別名稱（不含「全部產品」）
 * @param {Array<{ category?: string }>} list
 * @returns {string[]}
 */
function extractCategoryNames(list) {
  return [...new Set(list.map((p) => p.category).filter(Boolean))].sort();
}

export default function ProductList() {
  const dispatch = useDispatch();
  const cancelledRef = useRef(false);

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  /** 背景是否仍下載第 2 頁起（僅影響左側分類區 UI） */
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  /** 首屏：僅等第 1 頁 */
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    cancelledRef.current = false;
    let alive = true;

    async function load() {
      setInitialLoading(true);
      setCategoriesLoading(true);
      setAllProducts([]);
      setCategories([ALL_CATEGORY]);

      try {
        const { products, pagination } = await getPublicProductsFirstPage();
        if (!alive || cancelledRef.current) return;

        const pp = Number(pagination?.per_page);
        setPerPage(Number.isFinite(pp) && pp > 0 ? pp : DEFAULT_PER_PAGE);
        setAllProducts(products);

        const totalPages = Math.max(1, Number(pagination?.total_pages) || 1);
        if (totalPages <= 1) {
          setCategories([ALL_CATEGORY, ...extractCategoryNames(products)]);
          setCategoriesLoading(false);
        } else {
          fetchRemainingPublicProductPages(totalPages)
            .then((rest) => {
              if (!alive || cancelledRef.current) return;
              setAllProducts((prev) => [...prev, ...rest]);
              const merged = [...products, ...rest];
              setCategories([ALL_CATEGORY, ...extractCategoryNames(merged)]);
              setCategoriesLoading(false);
            })
            .catch((error) => {
              if (!alive || cancelledRef.current) return;
              dispatch(
                showNotification({
                  type: "error",
                  message: error?.response?.data?.message ?? "載入其餘產品失敗，分類可能不完整",
                })
              );
              setCategories([ALL_CATEGORY, ...extractCategoryNames(products)]);
              setCategoriesLoading(false);
            });
        }
      } catch (error) {
        if (!alive || cancelledRef.current) return;
        dispatch(
          showNotification({
            type: "error",
            message: error?.response?.data?.message ?? "取得產品資料失敗，請稍後再試",
          })
        );
        setAllProducts([]);
        setCategories([ALL_CATEGORY]);
        setCategoriesLoading(false);
      } finally {
        if (alive && !cancelledRef.current) {
          setInitialLoading(false);
        }
      }
    }

    load();
    return () => {
      alive = false;
      cancelledRef.current = true;
    };
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return allProducts;
    return allProducts.filter((p) => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage) || 1);
  const safePage = Math.min(currentPage, totalPages);

  const pagination = useMemo(
    () => ({
      current_page: safePage,
      total_pages: totalPages,
      total: totalCount,
      per_page: perPage,
      has_pre: safePage > 1,
      has_next: safePage < totalPages,
    }),
    [safePage, totalPages, totalCount, perPage]
  );

  const displayProducts = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, safePage, perPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const activeCategory = selectedCategory ?? ALL_CATEGORY;

  const handleCategoryClick = (cat) => {
    if (categoriesLoading) return;
    const category = cat === ALL_CATEGORY ? null : cat;
    setSelectedCategory(category);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCloseModal = useCallback(() => setSelectedProduct(null), []);

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

  const openModal = (productId) => {
    const product = allProducts.find((p) => p.id === productId);
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
        <ListLoadingOverlay show={initialLoading} message="載入產品中…" />
        <div
          className={`row g-3 ${initialLoading ? "opacity-0" : ""}`}
          style={initialLoading ? { pointerEvents: "none" } : undefined}
          aria-hidden={initialLoading}
        >
          <aside className="col-md-3 col-lg-2">
            <div className="card card-accent-green">
              <div className="card-header fw-bold">產品分類</div>
              <div className="card-body p-2">
                {categoriesLoading ? (
                  <div className="text-center px-1">
                    <p className="small text-muted mb-2 mb-md-3">載入分類中…</p>
                    <div className="d-flex justify-content-center py-1" aria-live="polite">
                      <div className="spinner-border spinner-border-sm text-secondary" role="status">
                        <span className="visually-hidden">載入分類中</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 展開「產品分類」清單陣列，顯示全部、其他分類
                  categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`btn btn-sm w-100 text-start mb-1 ${
                          isActive ? "btn-success" : "btn-outline-success"
                        }`}
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => handleCategoryClick(cat)}
                      >
                        {cat}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <main className="col-md-9 col-lg-10">
            <h3 className="mb-1">
              <FaListUl className="text-warning me-2" size={24} />
              產品列表
            </h3>
            <p className="text-muted mb-1">
              共 {totalCount} 項{activeCategory !== ALL_CATEGORY ? `「${activeCategory}」` : ""}商品
              {categoriesLoading ? (
                <span className="d-inline-block ms-1 small">（資料載入中，筆數將隨背景同步更新）</span>
              ) : null}
            </p>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
              {displayProducts.length === 0 ? (
                <div className="w-100 text-muted py-5">目前沒有符合條件的商品</div>
              ) : (
                displayProducts.map((item, index) => (
                  <div key={item.id} className="col">
                    <div className="card h-100 border border-1 border-primary rounded-2 text-center">
                      <div className="card-body d-flex flex-column">
                        <div
                          className="rounded px-0 py-0 mb-0 overflow-hidden text-center position-relative"
                          style={{ height: "300px", backgroundColor: "#f8f9fa" }}
                        >
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
                        <div className="h4 text-start text-dark d-flex flex-wrap align-items-center gap-1 mb-0">
                          <span className="flex-grow-1 min-w-0">{item.title}</span>
                          {item.category ? (
                            <small className="fs-6 fw-light bg-secondary text-white px-1 py-0 rounded-pill text-nowrap flex-shrink-0">
                              {item.category}
                            </small>
                          ) : null}
                        </div>
                        <div className="mt-0 gap-2 text-start">{item.description}</div>
                        <div className="d-flex justify-content-between align-items-center mt-2 gap-2">
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="text-muted small">價格：</span>
                            <span className="text-decoration-line-through opacity-75">
                              <MoneyAmount value={Number(item.origin_price)} />
                            </span>
                            <MoneyAmount value={Number(item.price)} className="text-danger fw-semibold" />
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center gap-2 mt-1 flex-nowrap overflow-hidden">
                          <div className="small text-muted text-nowrap">
                            單位：<span className="text-dark fw-semibold">{item.unit || "—"}</span>
                          </div>
                          <div className="d-flex align-items-center gap-0 text-nowrap flex-shrink-1">
                            <span className="small text-muted">評分：</span>
                            {[1, 2, 3, 4, 5].map((i) =>
                              i <= (item.rating ?? 0) ? (
                                <FaStar key={i} className="text-warning" size={14} />
                              ) : (
                                <FaRegStar key={i} className="text-secondary" size={14} />
                              )
                            )}
                          </div>
                        </div>
                        <button type="button" className="btn btn-outline-primary mt-3" onClick={() => openModal(item.id)}>
                          <FaEye className="md-2 text-warning" size={24} />
                          查看明細
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <br />
            <Pagination pagination={pagination} onChangePage={handlePageChange} />
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
