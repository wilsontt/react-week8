/**
 * 結帳流程 Redux Slice
 * 記住步驟、表單資料、訂單資訊，支援回上一頁修改
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderApi from "../services/orderApi";

export const createOrderThunk = createAsyncThunk(
  "checkout/createOrder",
  async ({ user, message, couponCode }, { rejectWithValue }) => {
    try {
      const res = await orderApi.createOrder(user, message, couponCode ?? null);
      return res;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? "建立訂單失敗");
    }
  }
);

export const payOrderThunk = createAsyncThunk(
  "checkout/payOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await orderApi.payOrder(orderId);
      return res;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? "付款失敗");
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    /** 是否顯示結帳流程（按前往結帳後為 true，取消後為 false） */
    showCheckout: false,
    /** 目前步驟 1-4 */
    step: 1,
    /** 步驟 2 表單資料（記住以便回上一頁） */
    formData: {
      email: "",
      name: "",
      tel: "",
      address: "",
      message: "",
    },
    /** 訂單資訊（建立訂單後） */
    orderInfo: null,
    /** 付款方式 */
    paymentMethod: "",
    loading: false,
    error: null,
  },
  reducers: {
    startCheckout: (state) => {
      state.showCheckout = true;
      state.step = 1;
      state.error = null;
    },
    cancelCheckout: (state) => {
      state.showCheckout = false;
      state.step = 1;
      state.orderInfo = null;
      state.paymentMethod = "";
      state.error = null;
    },
    setStep: (state, action) => {
      state.step = action.payload;
      state.error = null;
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    resetCheckout: (state) => {
      state.showCheckout = false;
      state.step = 1;
      state.formData = { email: "", name: "", tel: "", address: "", message: "" };
      state.orderInfo = null;
      state.paymentMethod = "";
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orderInfo = action.payload?.data ?? action.payload;
        state.step = 3;
        state.error = null;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "建立訂單失敗";
      })
      .addCase(payOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.step = 4;
        state.error = null;
      })
      .addCase(payOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "付款失敗";
      });
  },
});

export const {
  startCheckout,
  cancelCheckout,
  setStep,
  setFormData,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions;

export const selectCheckout = (state) => state.checkout;

export default checkoutSlice.reducer;
