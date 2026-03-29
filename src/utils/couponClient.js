/**
 * 前台優惠券驗證與折抵計算（對應後台優惠券欄位：code、percent、due_date、is_enabled）
 */

/**
 * 後台儲存之 due_date 為該日 00:00:00（本地）Unix 秒；截止日當天 23:59:59.999 前仍視為有效
 * @param {number|string|null|undefined} dueDateUnixSeconds
 * @returns {boolean} 已超過截止日期則 true
 */
export function isCouponPastDueDate(dueDateUnixSeconds) {
  /** 無截止日欄位時不判斷為過期（避免誤擋；後台表單仍應必填） */
  if (dueDateUnixSeconds == null || dueDateUnixSeconds === "") {
    return false;
  }
  const dueStart = new Date(Number(dueDateUnixSeconds) * 1000);
  if (Number.isNaN(dueStart.getTime())) {
    return true;
  }
  const endOfDueDay = new Date(dueStart);
  endOfDueDay.setHours(23, 59, 59, 999);
  return Date.now() > endOfDueDay.getTime();
}

/**
 * 顯示用截止日期 YYYY-MM-DD（本地）
 * @param {number|string|null|undefined} dueDateUnixSeconds
 * @returns {string}
 */
export function formatCouponDueDateDisplay(dueDateUnixSeconds) {
  if (dueDateUnixSeconds == null || dueDateUnixSeconds === "") {
    return "—";
  }
  const d = new Date(Number(dueDateUnixSeconds) * 1000);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * @param {unknown} isEnabled - API 可能為 0/1 或 boolean
 * @returns {boolean}
 */
export function isCouponActiveEnabled(isEnabled) {
  return isEnabled === 1 || isEnabled === true || isEnabled === "1";
}

/**
 * 依折扣百分比計算折抵金額（無條件捨去）
 * @param {number} subtotal
 * @param {number} percent
 * @returns {number}
 */
export function computePercentDiscount(subtotal, percent) {
  const s = Number(subtotal) || 0;
  const p = Number(percent) || 0;
  return Math.floor((s * p) / 100);
}

/**
 * 優惠碼比對用正規化（去首尾空白、小寫、連續空白壓成單一空格）
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeCouponCodeForCompare(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * 自後台列表找出與輸入相符之優惠券（不分大小寫、空白正規化）
 * @param {Array<{ code?: string }>} coupons
 * @param {string} rawInput
 * @returns {Record<string, unknown>|null}
 */
export function findCouponByCode(coupons, rawInput) {
  const q = normalizeCouponCodeForCompare(rawInput);
  if (!q || !Array.isArray(coupons)) {
    return null;
  }
  const found = coupons.find((c) => normalizeCouponCodeForCompare(c?.code) === q);
  return found ?? null;
}

/**
 * 自單一物件讀取折扣百分比（1–100）；支援常見別名
 * @param {unknown} o
 * @returns {number}
 */
export function readPercentFromObject(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) {
    return 0;
  }
  const keys = [
    "percent",
    "discount_percent",
    "discountPercent",
    "percent_off",
    "off_percent",
  ];
  for (const k of keys) {
    if (k in o && o[k] != null && o[k] !== "") {
      const n = Number(o[k]);
      if (Number.isFinite(n) && n > 0 && n <= 100) {
        return Math.floor(n);
      }
    }
  }
  if ("discount" in o && o.discount != null && o.discount !== "") {
    const n = Number(o.discount);
    if (Number.isFinite(n) && n > 0 && n <= 100) {
      return Math.floor(n);
    }
  }
  if ("off" in o && o.off != null && o.off !== "") {
    const n = Number(o.off);
    if (Number.isFinite(n) && n > 0 && n <= 100) {
      return Math.floor(n);
    }
  }
  return 0;
}

/**
 * 自單一物件讀取固定折抵金額（元）
 * @param {unknown} o
 * @returns {number}
 */
export function readFixedDiscountFromObject(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) {
    return 0;
  }
  const keys = [
    "discount_amount",
    "discountAmount",
    "total_discount",
    "money_off",
    "discount_total",
    "amount_off",
  ];
  for (const k of keys) {
    if (k in o && o[k] != null && o[k] !== "") {
      const n = Number(o[k]);
      if (Number.isFinite(n) && n > 0) {
        return Math.floor(n);
      }
    }
  }
  return 0;
}

/**
 * 走訪整棵 JSON 取最大 percent 與最大固定折抵（客戶 coupon API 常把明細包在巢狀 data）
 * @param {unknown} node
 * @returns {{ maxP: number; maxF: number }}
 */
export function walkTreeDiscountStats(node) {
  let maxP = 0;
  let maxF = 0;
  const visited = new WeakSet();

  const walk = (n, depth) => {
    if (!n || typeof n !== "object" || depth > 14) {
      return;
    }
    if (visited.has(n)) {
      return;
    }
    visited.add(n);
    if (!Array.isArray(n)) {
      maxP = Math.max(maxP, readPercentFromObject(n));
      maxF = Math.max(maxF, readFixedDiscountFromObject(n));
    }
    for (const v of Object.values(n)) {
      if (v && typeof v === "object") {
        walk(v, depth + 1);
      }
    }
  };

  walk(node, 0);
  return { maxP, maxF };
}

/**
 * 自 JSON 樹中找出 code／coupon_code 與使用者輸入一致之物件，讀取其 percent（避免誤用他筆資料）
 * @param {unknown} node
 * @param {string} rawUserCode
 * @returns {number}
 */
export function readPercentForMatchingCouponCode(node, rawUserCode) {
  const target = normalizeCouponCodeForCompare(rawUserCode);
  if (!target) {
    return 0;
  }
  let best = 0;
  const visited = new WeakSet();

  const objectCodeMatches = (o) => {
    if (!o || typeof o !== "object") {
      return false;
    }
    const aliases = ["code", "coupon_code", "couponCode"];
    for (const k of aliases) {
      if (k in o && o[k] != null && String(o[k]).trim() !== "") {
        if (normalizeCouponCodeForCompare(o[k]) === target) {
          return true;
        }
      }
    }
    return false;
  };

  const walk = (n, depth) => {
    if (!n || typeof n !== "object" || depth > 16) {
      return;
    }
    if (visited.has(n)) {
      return;
    }
    visited.add(n);
    if (Array.isArray(n)) {
      for (const item of n) {
        walk(item, depth + 1);
      }
      return;
    }
    if (objectCodeMatches(n)) {
      best = Math.max(best, readPercentFromObject(n));
    }
    for (const v of Object.values(n)) {
      if (v && typeof v === "object") {
        walk(v, depth + 1);
      }
    }
  };

  walk(node, 0);
  return best;
}

/**
 * 自 JSON 樹讀取 `final_total`（ec-courses 客戶 POST /coupon 成功時常見於 `data.final_total`）
 * @see https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E5%AE%A2%E6%88%B6%E8%B3%BC%E7%89%A9%20-%20%E5%84%AA%E6%83%A0%E5%88%B8%20(Coupon)
 * @param {...unknown} roots
 * @returns {number|null}
 */
export function readFinalTotalFromCouponApiRoots(...roots) {
  for (const root of roots) {
    if (root == null || typeof root !== "object") {
      continue;
    }
    const v = findFinalTotalDeep(root);
    if (v != null) {
      return v;
    }
  }
  return null;
}

/**
 * @param {unknown} node
 * @param {WeakSet<object>} [visited]
 * @param {number} [depth]
 * @returns {number|null}
 */
function findFinalTotalDeep(node, visited = new WeakSet(), depth = 0) {
  if (!node || typeof node !== "object" || depth > 16) {
    return null;
  }
  if (visited.has(node)) {
    return null;
  }
  visited.add(node);
  if (!Array.isArray(node)) {
    if ("final_total" in node && node.final_total != null && node.final_total !== "") {
      const n = Number(node.final_total);
      if (Number.isFinite(n) && n >= 0) {
        return n;
      }
    }
  }
  for (const v of Object.values(node)) {
    if (v && typeof v === "object") {
      const f = findFinalTotalDeep(v, visited, depth + 1);
      if (f != null) {
        return f;
      }
    }
  }
  return null;
}

/**
 * 依「套用優惠前商品小計」與 API 回傳之優惠後總額 `final_total`，反推折扣百分比（無條件捨去，上限 100）
 * @param {number} subtotal - 目前購物車商品小計
 * @param {number} finalTotal - API `final_total`
 * @returns {number}
 */
export function impliedPercentFromSubtotalAndFinalTotal(subtotal, finalTotal) {
  const s = Number(subtotal);
  const f = Number(finalTotal);
  if (!Number.isFinite(s) || s <= 0 || !Number.isFinite(f) || f < 0 || f > s) {
    return 0;
  }
  const p = Math.floor(((s - f) / s) * 100);
  return Math.min(100, Math.max(0, p));
}

/**
 * 由驗證 API 回傳與 match 物件，決定 Redux 用的 percent 或固定折抵（優先百分比）
 * @param {unknown} matchObject - pick 出之優惠物件
 * @param {string} userInputCode - 使用者輸入之優惠碼（用於在 JSON 樹中對應正確一筆）
 * @param {...unknown} bodyRoots - 完整 JSON 根（unwrap 前後等）
 * @returns {{ percent: number; fixedDiscountAmount?: number; finalTotal: number|null }}
 */
export function resolveDiscountForAppliedCoupon(matchObject, userInputCode, ...bodyRoots) {
  const apiFinalTotal = readFinalTotalFromCouponApiRoots(...bodyRoots);
  let percent = readPercentFromObject(matchObject);
  let fixedRaw = readFixedDiscountFromObject(matchObject);
  for (const root of bodyRoots) {
    if (root == null || typeof root !== "object") {
      continue;
    }
    percent = Math.max(percent, readPercentForMatchingCouponCode(root, userInputCode));
    const { maxP, maxF } = walkTreeDiscountStats(root);
    percent = Math.max(percent, maxP);
    fixedRaw = Math.max(fixedRaw, maxF);
  }
  if (percent > 0) {
    return {
      percent: Math.min(100, percent),
      fixedDiscountAmount: undefined,
      finalTotal: apiFinalTotal,
    };
  }
  if (fixedRaw > 0) {
    return { percent: 0, fixedDiscountAmount: fixedRaw, finalTotal: apiFinalTotal };
  }
  return { percent: 0, fixedDiscountAmount: undefined, finalTotal: apiFinalTotal };
}

/** 深度尋找像優惠券的物件（含 code 或 percent 等欄位） */
function findCouponLikeObjectDeep(node, visited = new WeakSet(), depth = 0) {
  if (!node || typeof node !== "object" || depth > 14) {
    return null;
  }
  if (visited.has(node)) {
    return null;
  }
  visited.add(node);

  if (Array.isArray(node)) {
    for (const item of node) {
      const f = findCouponLikeObjectDeep(item, visited, depth + 1);
      if (f) {
        return f;
      }
    }
    return null;
  }

  const hasCode = "code" in node && node.code != null && String(node.code).trim() !== "";
  const hasPercent = "percent" in node && node.percent != null && String(node.percent) !== "";
  if (hasCode || hasPercent) {
    return node;
  }
  if ("percent" in node && ("title" in node || "due_date" in node || "is_enabled" in node)) {
    return node;
  }

  for (const v of Object.values(node)) {
    if (v && typeof v === "object") {
      const f = findCouponLikeObjectDeep(v, visited, depth + 1);
      if (f) {
        return f;
      }
    }
  }
  return null;
}

/**
 * 客戶端優惠碼 API 是否視為成功（各站台可能用 boolean / 數字 / 字串）
 * @param {unknown} body
 * @returns {boolean}
 */
export function isCustomerCouponApiSuccess(body) {
  if (!body || typeof body !== "object") {
    return false;
  }
  const s = body.success;
  if (s === true || s === 1 || s === "true" || s === "TRUE") {
    return true;
  }
  /** 少數文件風格：code === 0 表示成功 */
  if (body.code === 0 && body.data != null) {
    return true;
  }
  return false;
}

/**
 * 無 `success` 欄位但本體已像優惠券資料（HTTP 200 且 axios 未拋錯時）
 * @param {unknown} body
 * @returns {boolean}
 */
export function isImplicitCustomerCouponSuccessBody(body) {
  if (!body || typeof body !== "object") {
    return false;
  }
  if ("success" in body && body.success != null) {
    return false;
  }
  return findCouponLikeObjectDeep(body) != null;
}

/**
 * 將一層信封剝除（例如外層僅 `{ data: { success, ... } }`）
 * @param {unknown} body
 * @returns {Record<string, unknown>|null}
 */
export function unwrapCustomerCouponResponse(body) {
  if (!body || typeof body !== "object") {
    return null;
  }
  if (body.success !== undefined || body.coupon != null) {
    return body;
  }
  const d = body.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    if (
      "success" in d ||
      "coupon" in d ||
      "code" in d ||
      "percent" in d ||
      (d.data != null && typeof d.data === "object")
    ) {
      return d;
    }
  }
  return body;
}

/**
 * 自 `POST .../coupon`（客戶驗證優惠碼）回傳中取出單一優惠券物件
 * @param {unknown} body - 已 unwrap 之 axios `data`
 * @param {string} [userInputCode] - 使用者輸入（補上 API 未回傳的 code）
 * @returns {Record<string, unknown>|null}
 */
export function pickCouponFromCustomerValidateBody(body, userInputCode = "") {
  const fb = String(userInputCode ?? "").trim();
  if (!body || typeof body !== "object") {
    return null;
  }
  if (!isCustomerCouponApiSuccess(body) && !isImplicitCustomerCouponSuccessBody(body)) {
    return null;
  }

  const tryCandidates = [];

  const push = (x) => {
    if (x && typeof x === "object" && !Array.isArray(x)) {
      tryCandidates.push(x);
    }
  };

  push(body.coupon);
  const d = body.data;
  if (d != null && typeof d === "object") {
    if (Array.isArray(d)) {
      for (const item of d) {
        push(item);
      }
    } else {
      push(d);
      push(d.coupon);
      if (d.data != null && typeof d.data === "object") {
        push(d.data);
        if (d.data.coupon) {
          push(d.data.coupon);
        }
      }
    }
  }
  push(body);

  const score = (o) => {
    let s = 0;
    if ("code" in o && o.code != null && String(o.code).trim() !== "") {
      s += 3;
    }
    if (readPercentFromObject(o) > 0) {
      s += 6;
    } else if ("percent" in o && o.percent != null && o.percent !== "") {
      s += 3;
    }
    if ("title" in o) {
      s += 1;
    }
    if ("due_date" in o) {
      s += 1;
    }
    if ("is_enabled" in o) {
      s += 1;
    }
    return s;
  };

  let best = null;
  let bestScore = -1;
  for (const c of tryCandidates) {
    const sc = score(c);
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }

  if (bestScore < 2) {
    const deep = findCouponLikeObjectDeep(body);
    if (deep) {
      best = deep;
      bestScore = score(deep);
    }
  }

  if (best && (bestScore >= 2 || "percent" in best || "code" in best)) {
    const codeVal =
      best.code != null && String(best.code).trim() !== ""
        ? String(best.code).trim()
        : fb;
    if (!codeVal) {
      return null;
    }
    return { ...best, code: codeVal };
  }

  /** API 僅宣告成功、本體無明細時仍允許套用（折數由結帳 API 再驗）；前台小計若無 percent 則顯示 0% 折抵 */
  if (fb) {
    return {
      code: fb,
      percent: 0,
      title: "",
      is_enabled: 1,
      due_date: null,
    };
  }

  return null;
}
