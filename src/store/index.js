/**
 * Redux Store（slice 模組位於 `src/slices/`）
 */
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../slices/cartSlice";
import notificationReducer from "../slices/notificationSlice";
import checkoutReducer from "../slices/checkoutSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    notification: notificationReducer,
    checkout: checkoutReducer,
  },
});
