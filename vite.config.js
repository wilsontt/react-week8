import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 產品、開發中 的路徑 固定
  // ? 的後面是  正式環境，就是你儲存庫的名字 。
  // : 的後面是  開發中環境。
  // process.env.NODE_ENV 是 Vite 提供的環境變數，用於判斷當前是生產環境還是開發環境。
  base: process.env.NODE_ENV === 'production' ? '/react-week7/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 監聽所有網路介面
    port: 5173,      // 可自訂埠號
    strictPort: false, // 如果埠號被占用，自動嘗試下一個
  },
})
