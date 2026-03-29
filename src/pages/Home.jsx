/**
 * 首頁：上方輪播、中間文字、下方專欄主題連結
 */
import { Link } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";
import PageWithLogoBg from "../components/common/PageWithLogoBg";

import img1 from "../assets/首頁-1.png";
import img2 from "../assets/首頁-2.png";
import img3 from "../assets/首頁-3.png";

const CAROUSEL_IMAGES = [
  { src: img1, alt: "客製化植栽展示" },
  { src: img2, alt: "多肉與花卉佈置造景" },
  { src: img3, alt: "室內綠化造景" },
];

function Home() {
  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <div className="w-95 mx-auto">
        {/* 上方：3 張圖輪播 */}
        <div
          id="homeCarousel"
          className="carousel slide carousel-fade mb-4 rounded overflow-hidden shadow-sm"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {CAROUSEL_IMAGES.map((item, index) => (
              <div
                key={item.alt}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <img
                  src={item.src}
                  className="d-block w-95 text-center"
                  style={{ objectFit: "cover", maxHeight: "400px", margin: "0 auto" }}
                  alt={item.alt}
                />
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

        {/* 中間：文字（含專欄教學精要，與下方專欄卡片呼應） */}
        <div className="w-100 text-center mb-4">
          <h2 className="mb-2">
            <FaLeaf className="text-success me-2" /> 花草的世界
          </h2>
          <p className="text-muted mb-3 fw-semibold">
            嚴選花卉，傳遞心意。專注於打造客製化植栽的世界！</p>
          <div
            className="mx-auto text-start text-md-center px-2 mb-4"
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
            <p className="small mb-0">
              <Link to="/column/succulent" className="text-success text-decoration-none fw-semibold">
                閱讀：認識多肉植物
              </Link>
              <span className="text-muted mx-2" aria-hidden="true">
                ｜
              </span>
              <Link to="/column/landscape" className="text-success text-decoration-none fw-semibold">
                閱讀：佈置造景
              </Link>
            </p>
          </div>
          <p className="small text-muted mb-0">
            <FaLeaf className="me-1 text-success" />品質把關 · 安心配送 · 貼心服務
          </p>
        </div>

      </div>
      {/* 下方：2 個專欄主題連結（左右各一） */}
      <div className="row g-6 w-50 justify-content-center">
        <div className="col-12 col-md-6 col-lg-6 w-50">
          <Link
            to="/column/succulent"
            className="card text-decoration-none text-dark h-100 border shadow-sm"
          >
            <div className="card-body text-center">
              <h5 className="card-title">認識多肉植物</h5>
              <p className="card-text text-muted small mb-0">
                了解多肉植物的種類與照顧方式
              </p>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-lg-6 w-50">
          <Link
            to="/column/landscape"
            className="card text-decoration-none text-dark h-100 border shadow-sm"
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
      <br />
    </PageWithLogoBg>
  );
}

export default Home;
