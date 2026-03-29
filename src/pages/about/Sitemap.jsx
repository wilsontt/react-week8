import { Link } from "react-router-dom";
import { FaSitemap } from "react-icons/fa";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";

/**
 * 網站地圖樹狀資料（與 Navbar、frontend/admin 路由對齊）
 * @typedef {{ id: string, label: string, to?: string, children?: SitemapNode[] }} SitemapNode
 */

/** @type {SitemapNode} */
const SITEMAP_TREE = {
  id: "root",
  label: "花草的世界",
  children: [
    { id: "home", label: "首頁", to: "/" },
    {
      id: "about",
      label: "關於我們",
      to: "/about",
      children: [
        { id: "about-main", label: "關於我們", to: "/about" },
        { id: "about-sitemap", label: "網站地圖", to: "/about/sitemap" },
      ],
    },
    {
      id: "column",
      label: "專欄教學",
      to: "/column/succulent",
      children: [
        { id: "column-succulent", label: "認識多肉植物", to: "/column/succulent" },
        { id: "column-landscape", label: "多肉與花卉佈置造景", to: "/column/landscape" },
      ],
    },
    { id: "productList", label: "產品列表", to: "/productList" },
    { id: "cart", label: "客戶購物車", to: "/cart" },
    {
      id: "admin",
      label: "後台管理",
      to: "/admin",
      children: [
        { id: "admin-login", label: "登入", to: "/admin/Login" },
        { id: "admin-products", label: "產品列表管理", to: "/admin/Products" },
        { id: "admin-orders", label: "客戶訂單管理", to: "/admin/OrderList" },
        { id: "admin-coupons", label: "優惠券管理", to: "/admin/CouponList" },
      ],
    },
  ],
};

/**
 * 單一樹狀節點（膠囊）；有路徑則為 Link
 * @param {{ label: string, to?: string, level: number }} props
 */
function SitemapPill({ label, to, level }) {
  const pillClass = `sitemap-tree-pill sitemap-tree-pill--l${level}`;
  if (to) {
    return (
      <Link to={to} className={`${pillClass} sitemap-tree-pill--link text-decoration-none`}>
        {label}
      </Link>
    );
  }
  return <span className={pillClass}>{label}</span>;
}

/**
 * 一欄：可為葉節點或含子層
 * @param {{ node: SitemapNode, level: number, showConnectorDown?: boolean }} props
 */
function SitemapBranch({ node, level, showConnectorDown = true }) {
  const kids = node.children;
  const hasKids = Boolean(kids?.length);

  if (!hasKids) {
    return (
      <div className="sitemap-tree-branch sitemap-tree-branch--leaf">
        {showConnectorDown ? (
          <div className="sitemap-tree-line sitemap-tree-line--down-short" aria-hidden />
        ) : null}
        <SitemapPill label={node.label} to={node.to} level={level} />
      </div>
    );
  }

  return (
    <div className="sitemap-tree-branch sitemap-tree-branch--group">
      {showConnectorDown ? (
        <div className="sitemap-tree-line sitemap-tree-line--down-short" aria-hidden />
      ) : null}
      <SitemapPill label={node.label} to={node.to} level={level} />
      <div className="sitemap-tree-line sitemap-tree-line--after-parent" aria-hidden />
      <div className="sitemap-tree-children">
        {kids.map((child) => (
          <div key={child.id} className="sitemap-tree-child-col">
            <div className="sitemap-tree-line sitemap-tree-line--down-short" aria-hidden />
            {child.children?.length ? (
              <SitemapBranch node={child} level={level + 1} showConnectorDown={false} />
            ) : (
              <SitemapPill label={child.label} to={child.to} level={level + 1} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sitemap() {
  const root = SITEMAP_TREE;

  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <div className="sitemap-tree-page w-100 text-center px-2 px-md-3">
        <h2 className="text-center mb-2">
          <FaSitemap className="text-secondary me-2" size={32} />
          網站地圖
        </h2>
        <p className="text-muted small mb-4">本站架構一覽（點選節點可前往該頁）</p>

        <div className="sitemap-tree-board mx-auto">
          <div className="sitemap-tree-root-row">
            <SitemapPill label={root.label} level={0} />
          </div>
          <div className="sitemap-tree-below-root">
            <div className="sitemap-tree-line sitemap-tree-line--root-spine" aria-hidden />
            <div className="sitemap-tree-level1">
              {root.children.map((child) => (
                <SitemapBranch key={child.id} node={child} level={1} />
              ))}
            </div>
          </div>
        </div>

        <p className="small text-muted mt-4 mb-0 px-2">
          後台除「登入」外之頁面需管理員權限；未登入時將導向登入頁。
        </p>
      </div>

      <style>{`
        .sitemap-tree-page {
          --sitemap-cream: #f5f0e6;
          --sitemap-line: #6b5344;
          --sitemap-l0: #5a6d7e;
          --sitemap-l0-text: #f8f9fa;
          --sitemap-l1: #c9b896;
          --sitemap-l2: #c9a0a0;
          --sitemap-l3: #a898c0;
        }

        .sitemap-tree-board {
          background: var(--sitemap-cream);
          border-radius: 16px;
          padding: 28px 16px 32px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          max-width: 1100px;
          overflow-x: auto;
        }

        .sitemap-tree-root-row {
          display: flex;
          justify-content: center;
        }

        .sitemap-tree-below-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .sitemap-tree-line--root-spine {
          height: 16px;
          margin: 0 auto;
        }

        .sitemap-tree-level1 {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: flex-start;
          gap: 8px 20px;
          width: 100%;
          padding-top: 14px;
          border-top: 2px solid var(--sitemap-line);
        }

        .sitemap-tree-branch {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 220px;
        }

        .sitemap-tree-branch--leaf {
          min-width: 120px;
        }

        .sitemap-tree-children {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px 14px;
          padding-top: 14px;
          margin-top: 2px;
          border-top: 2px solid var(--sitemap-line);
          min-width: min(100%, 200px);
        }

        .sitemap-tree-child-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sitemap-tree-line {
          width: 2px;
          flex-shrink: 0;
          background: var(--sitemap-line);
        }

        .sitemap-tree-line--after-parent {
          height: 10px;
        }

        .sitemap-tree-line--down-short {
          height: 12px;
          margin-bottom: 2px;
        }

        .sitemap-tree-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.25;
          color: #1a1a1a;
          border: 2px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .sitemap-tree-pill--l0 {
          background: var(--sitemap-l0);
          color: var(--sitemap-l0-text);
          border-color: rgba(255, 255, 255, 0.2);
          font-size: 1rem;
          padding: 12px 28px;
        }

        .sitemap-tree-pill--l1 {
          background: var(--sitemap-l1);
        }

        .sitemap-tree-pill--l2 {
          background: var(--sitemap-l2);
          font-size: 0.82rem;
          padding: 8px 14px;
        }

        .sitemap-tree-pill--l3 {
          background: var(--sitemap-l3);
          font-size: 0.8rem;
          padding: 8px 12px;
        }

        .sitemap-tree-pill--link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          color: #0d0d0d;
        }

        .sitemap-tree-pill--l0.sitemap-tree-pill--link:hover {
          color: #fff;
        }
      `}</style>
    </PageWithLogoBg>
  );
}
