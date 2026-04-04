/**
 * 首頁：上方輪播、中間文字、主打產品（評分 5 分）、限時優惠、下方專欄主題連結
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaLeaf, FaRegCopy, FaStar } from "react-icons/fa";
import PageWithLogoBg from "../components/common/PageWithLogoBg";
import MoneyAmount from "../components/common/MoneyAmount";
import { showNotification } from "../slices/notificationSlice";
import { getAllPublicProducts } from "../services/productApi";

import img1 from "../assets/home-carousel-1.png";
import img2 from "../assets/home-carousel-2.png";
import img3 from "../assets/home-carousel-3.png";
import "../components/common/card-accent-green.css";
import "./home.css";

/** 兒童節檔期（精選活動碼；須與後台優惠券 code 一致方可於購物車套用） */
const CHILDREN_DAY_PROMO = {
  title: "慶祝兒童節 · 植栽同樂會",
  code: "2026_Children's Day",
  dueDate: "2026-04-30",
  discountShort: "整單 90 折",
  /** 行銷主文案 */
  pitch:
    "大手牽小手，把春天種進家裡！花草的世界推出兒童節限定——為孩子挑一盆好照顧的多肉或小品植栽，在澆水與觀察裡一起長大。活動期間結帳輸入下方優惠碼，即享整單以售價計算之 95 折優惠，讓綠意成為全家人共同的回憶。優惠有限期，敬請把握！",
};

const CAROUSEL_IMAGES = [
  { src: img1, alt: "客製化植栽展示" },
  { src: img2, alt: "多肉與花卉佈置造景" },
  { src: img3, alt: "室內綠化造景" },
];

/** 是否為五星且已啟用（前台可購） */
function isFiveStarEnabled(product) {
  const r = Math.floor(Number(product?.rating));
  if (r !== 5) return false;
  return Boolean(product?.is_enabled ?? true);
}

function Home() {
  const dispatch = useDispatch();
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const handleCopyPromoCode = useCallback(async () => {
    const code = CHILDREN_DAY_PROMO.code;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        throw new Error("clipboard_unavailable");
      }
      dispatch(showNotification({ type: "success", message: "已複製優惠碼，請至購物車貼上並套用" }));
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "無法自動複製，請手動選取優惠碼文字",
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    async function loadFeatured() {
      setFeaturedLoading(true);
      try {
        const all = await getAllPublicProducts();
        if (cancelled) return;
        const fiveStar = all.filter(isFiveStarEnabled);
        setFeaturedProducts(fiveStar);
      } catch {
        if (!cancelled) setFeaturedProducts([]);
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    }
    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageWithLogoBg className="container-fluid px-0" alignTop>
      <div className="container px-2 px-sm-3 pb-4">
        {/* 上方：3 張圖輪播（圖片 w-100，不要導致原圖寬度撐出 x 軸） */}
        <div
          id="homeCarousel"
          className="home-page__carousel carousel slide carousel-fade mb-4 rounded shadow-sm w-100 overflow-hidden"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {CAROUSEL_IMAGES.map((item, index) => (
              <div
                key={item.alt}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <img src={item.src} alt={item.alt} />
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#homeCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">上一張</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#homeCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">下一張</span>
          </button>
          <div className="carousel-indicators">
            {CAROUSEL_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                data-bs-target="#homeCarousel"
                data-bs-slide-to={i}
                className={i === 0 ? "active" : ""}
                aria-label={`第 ${i + 1} 張`}
              />
            ))}
          </div>
        </div>

        {/* 中間：文字置中，隨螢幕寬度縮放 */}
        <div className="w-100 text-center mb-4">
          <h2 className="mb-2">
            <FaLeaf className="text-success me-2" aria-hidden /> 花草的世界
          </h2>
          <p className="text-muted mb-3 fw-semibold px-1">
            嚴選花卉，傳遞心意。專注於打造客製化植栽的世界！
          </p>
          <div
            className="mx-auto text-center px-2 mb-4"
            style={{ maxWidth: "42rem" }}
          >
            <p className="text-muted small mb-2 lh-lg">
              在<strong className="text-body">「認識多肉植物」</strong>
              專欄中，我們從蓮座型、柱型到鳳梨科多肉談起，並整理照護最核心的三件事：陽光、空氣與水，讓您在家照顧小盆栽時更有依循。
            </p>
            <p className="text-muted small mb-3 lh-lg">
              <strong className="text-body">「多肉與花卉佈置造景」</strong>
              則分享如何把植栽帶進商業與居家空間——從場勘、討論與規劃、現場執行到後續保養，一步步把自然變成日常風景。
            </p>
            <hr />

            {/* 主打產品：評分 5 分（取代原「閱讀」雙連結） */}
            <section
              className="home-page__featured text-start mb-0"
              aria-labelledby="home-featured-heading"
            >
              <h3
                id="home-featured-heading"
                className="h5 text-center mb-3 fw-bold text-body"
              >
                主打產品 · 五星好評
              </h3>
              {featuredLoading ? (
                <div className="text-center py-4 px-1" role="status" aria-live="polite">
                  <p className="small text-muted mb-2 mb-md-3">載入主打商品中…</p>
                  <div className="d-flex justify-content-center py-1">
                    <div className="spinner-border spinner-border-sm text-success" aria-hidden="true" />
                  </div>
                  <span className="visually-hidden">載入主打商品中</span>
                </div>
              ) : featuredProducts.length === 0 ? (
                <p className="text-muted small text-center mb-0 px-1">
                  目前尚無五星評分之商品上架展示。
                  <Link to="/productList" className="text-success fw-semibold ms-1">
                    前往產品列表
                  </Link>
                </p>
              ) : (
                <>
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 justify-content-center">
                    {featuredProducts.map((p) => (
                      <div key={p.id} className="col">
                        <article className="card h-100 border border-success border-opacity-25 shadow-sm home-page__featured-card">
                          <div className="ratio ratio-4x3 bg-light overflow-hidden rounded-top">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="object-fit-cover"
                              />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center text-muted small">
                                無圖片
                              </div>
                            )}
                          </div>
                          <div className="card-body d-flex flex-column">
                            <h4 className="card-title h6 mb-1 text-truncate" title={p.title}>
                              {p.title}
                            </h4>
                            <p className="small text-muted mb-2 text-truncate" title={p.category}>
                              {p.category}
                            </p>
                            <div
                              className="d-flex align-items-center gap-1 mb-2 text-warning"
                              aria-label="評分 5 分"
                            >
                              {[1, 2, 3, 4, 5].map((i) => (
                                <FaStar key={i} size={16} aria-hidden />
                              ))}
                              <span className="small text-muted ms-1">5</span>
                            </div>
                            <div className="mt-auto d-flex flex-wrap align-items-baseline gap-2">
                              <span className="text-decoration-line-through text-muted small">
                                <MoneyAmount value={Number(p.origin_price)} />
                              </span>
                              <MoneyAmount
                                value={Number(p.price)}
                                className="text-danger fw-bold"
                              />
                            </div>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/productList" className="btn btn-success btn-sm">
                      前往產品列表選購
                    </Link>
                  </div>
                </>
              )}
            </section>

            <section
              className="home-page__promo text-start mt-4 pt-4 border-top"
              aria-labelledby="home-promo-heading"
            >
              <h3 id="home-promo-heading" className="h5 text-center mb-3 fw-bold text-body">
                {CHILDREN_DAY_PROMO.title}
              </h3>
              <p className="small text-muted lh-lg mb-3">{CHILDREN_DAY_PROMO.pitch}</p>
              <div className="card-accent-green border rounded-3 p-3 p-md-4 shadow-sm">
                <dl className="row small mb-3 gx-2 gy-2 mb-md-4">
                  <dt className="col-sm-3 text-muted">優惠內容</dt>
                  <dd className="col-sm-9 mb-0 fw-semibold text-success">{CHILDREN_DAY_PROMO.discountShort}</dd>
                  <dt className="col-sm-3 text-muted">截止日期</dt>
                  <dd className="col-sm-9 mb-0">{CHILDREN_DAY_PROMO.dueDate}</dd>
                  <dt className="col-sm-3 text-muted">優惠碼</dt>
                  <dd className="col-sm-9 mb-0">
                    <code className="home-page__promo-code user-select-all">{CHILDREN_DAY_PROMO.code}</code>
                  </dd>
                </dl>
                <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start">
                  <button
                    type="button"
                    className="btn btn-success btn-sm d-inline-flex align-items-center gap-2"
                    onClick={handleCopyPromoCode}
                  >
                    <FaRegCopy aria-hidden />
                    複製優惠碼
                  </button>
                  <Link to="/cart" className="btn btn-outline-success btn-sm">
                    前往購物車套用
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
        <hr />

        {/* 下方：2 個專欄主題（窄螢幕直向堆疊、置中；勿與 w-50 等並用造成溢出） */}
        <div className="row g-3 g-md-4 justify-content-center mx-0 w-100">
          <div className="col-md-6 col-lg-5 d-flex">
            <Link
              to="/column/succulent"
              className="card text-decoration-none text-dark h-100 border shadow-sm w-100"
            >
              <div className="card-body text-center">
                <h5 className="card-title">認識多肉植物</h5>
                <p className="card-text text-muted small mb-0">
                  了解多肉植物的種類與照顧方式
                </p>
              </div>
            </Link>
          </div>
          <div className="col-md-6 col-lg-5 d-flex">
            <Link
              to="/column/landscape"
              className="card text-decoration-none text-dark h-100 border shadow-sm w-100"
            >
              <div className="card-body text-center">
                <h5 className="card-title">多肉與花卉佈置造景</h5>
                <p className="card-text text-muted small mb-0">
                  空間造景介紹與造景規劃流程
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </PageWithLogoBg>
  );
}

export default Home;
