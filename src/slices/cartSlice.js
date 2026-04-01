/**
 * 購物車 Redux Slice
 * 參考架構：Store ← Slice (Cart, Products, Notification)
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../services/cartApi";
import { computePercentDiscount } from "../utils/couponClient";

/** 固定運費（展示用；無 API 時使用） */
export const SHIPPING_FEE = 120;

/** 非同步：取得購物車 */
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart();
      const list = res?.data?.carts ?? res?.data ?? res?.carts ?? [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? "無法取得購物車");
    }
  }
);

/** 非同步：加入購物車 */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, qty }, { rejectWithValue, dispatch }) => {
    try {
      await cartApi.addToCart(productId, qty);
      const result = await dispatch(fetchCart());
      return result.payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? "加入購物車失敗");
    }
  }
);

/** 非同步：更新數量 */
export const updateCartQty = createAsyncThunk(
  "cart/updateQty",
  async ({ cartId, qty, productId }, { rejectWithValue, dispatch }) => {
    try {
      await cartApi.updateCartItem(cartId, qty, productId);
      const result = await dispatch(fetchCart());
      return result.payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? "更新失敗");
    }
  }
);

/** 非同步：刪除項目 */
export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (cartId, { rejectWithValue, dispatch }) => {
    try {
      await cartApi.removeCartItem(cartId);
      const result = await dispatch(fetchCart());
      return result.payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? "刪除失敗");
    }
  }
);

/** 非同步：清空購物車 */
export const clearCart = createAsyncThunk(
  "cart/clearAll",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await cartApi.clearCart();
      const result = await dispatch(fetchCart());
      return result.payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? "清空失敗");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    carts: [],
    loading: false,
    error: null,
    /**
     * 已套用之優惠券（通過截止日／啟用驗證後寫入）
     * @type {{ code: string, percent: number, title?: string, fixedDiscountAmount?: number } | null}
     */
    appliedCoupon: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    /** 套用優惠券（僅在驗證通過後由 Cart 頁 dispatch） */
    setAppliedCoupon: (state, action) => {
      state.appliedCoupon = action.payload ?? null;
    },
    /** 取消優惠券（清空購物車、手動清除、或驗證失敗時） */
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.carts = action.payload ?? [];
        state.error = null;
        if (!state.carts.length) {
          state.appliedCoupon = null;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.carts = [];
        state.error = action.payload ?? "無法取得購物車";
      })
      .addCase(addToCart.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload ?? "加入購物車失敗";
      })
      .addCase(updateCartQty.rejected, (state, action) => {
        state.error = action.payload ?? "更新失敗";
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = action.payload ?? "刪除失敗";
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload ?? "清空失敗";
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.appliedCoupon = null;
      });
  },
});

export const { clearError, setAppliedCoupon, clearAppliedCoupon } = cartSlice.actions;

/** Selectors */
export const selectCarts = (state) => state.cart.carts;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectTotalQty = (state) =>
  (state.cart.carts ?? []).reduce((sum, item) => sum + (item?.qty ?? 0), 0);
export const selectTotalAmount = (state) =>
  (state.cart.carts ?? []).reduce((sum, item) => {
    const price = item?.product?.price ?? item?.price ?? 0;
    const qty = item?.qty ?? 0;
    return sum + Number(price) * qty;
  }, 0);

/** 目前套用中的優惠券（通過驗證者） */
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;

/** 依商品小計與優惠券 percent（或固定折抵金額）計算之折抵金額 */
export const selectCouponDiscountAmount = (state) => {
  const coupon = state.cart.appliedCoupon;
  if (!coupon) return 0;
  const subtotal = selectTotalAmount(state);
  const pct = Number(coupon.percent) || 0;
  if (pct > 0) {
    return computePercentDiscount(subtotal, pct);
  }
  const fixed = Number(coupon.fixedDiscountAmount);
  if (Number.isFinite(fixed) && fixed > 0) {
    return Math.min(Math.floor(fixed), subtotal);
  }
  return 0;
};

/** 折抵後商品小計（不含運費） */
export const selectTotalAfterCoupon = (state) => {
  const subtotal = selectTotalAmount(state);
  const off = selectCouponDiscountAmount(state);
  return Math.max(0, subtotal - off);
};

/** 訂單金額摘要：小計、折抵、運費、應付（全站結帳流程共用） */
export const selectCartOrderTotals = (state) => {
  const productSubtotal = selectTotalAmount(state);
  const couponDiscount = selectCouponDiscountAmount(state);
  const afterCoupon = Math.max(0, productSubtotal - couponDiscount);
  const shippingFee = afterCoupon > 0 ? SHIPPING_FEE : 0;
  return {
    productSubtotal,
    couponDiscount,
    afterCoupon,
    shippingFee,
    totalPayable: afterCoupon + shippingFee,
  };
};

export default cartSlice.reducer;
