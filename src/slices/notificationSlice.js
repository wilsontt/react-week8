/**
 * 通知訊息 Redux Slice
 * 用於成功／錯誤 Toast；實際顯示與自動關閉秒數由 `NotificationToast.jsx` 負責（目前 5 秒）
 */
import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    visible: false,
    type: "success", // success | error
    message: "",
  },
  reducers: {
    showNotification: (state, action) => {
      const { type = "success", message } = action.payload ?? {};
      state.visible = true;
      state.type = type;
      state.message = message ?? "";
    },
    hideNotification: (state) => {
      state.visible = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;

export const selectNotification = (state) => state.notification;

export default notificationSlice.reducer;
