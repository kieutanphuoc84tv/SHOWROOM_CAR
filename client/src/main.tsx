// ============================================================
// 🚀 main.tsx — "Cổng vào" của toàn bộ ứng dụng React
//
// 📖 GIẢI THÍCH CHO BẠN:
// ────────────────────────────────────────────────────────────
// Trong Node.js, bạn có file "app.ts" là entry point, nơi bạn viết:
//   app.listen(3000)  →  server bắt đầu lắng nghe request
//
// Trong React, "main.tsx" cũng là entry point, nhưng nó làm việc khác:
//   ReactDOM.createRoot(...)  →  React "chiếm quyền" một thẻ HTML
//   .render(<App />)          →  và vẽ toàn bộ giao diện vào đó
//
// File index.html có 1 thẻ <div id="root"></div> trống rỗng.
// React sẽ "fill" nội dung vào thẻ đó bằng JavaScript.
// Đó là lý do React được gọi là SPA (Single Page Application).
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import CSS global (TailwindCSS + theme)
import './index.css'

// Import cấu hình i18n — phải import TRƯỚC App để i18n sẵn sàng
import './lib/i18n'

// Import component gốc
import App from './App'

// ── Render ứng dụng ───────────────────────────────────────────
// document.getElementById('root')  →  lấy thẻ <div id="root"> từ HTML
// createRoot(...)                   →  tạo React root tại đó
// .render(...)                      →  vẽ component <App /> lên màn hình
//
// StrictMode: chỉ hoạt động khi dev, giúp phát hiện lỗi sớm
// (render component 2 lần để check side effects — đừng lo nếu
// thấy console.log chạy 2 lần, đó là do StrictMode)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
