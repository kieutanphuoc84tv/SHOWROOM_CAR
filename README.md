# 🚗 NEXUS AUTO — HỆ THỐNG QUẢN LÝ SHOWROOM Ô TÔ CAO CẤP & 3D CAR EXPERIENCE

Hệ thống website thương mại điện tử và quản lý kinh doanh ô tô toàn diện (**Automotive Dealership Management System**), tích hợp trải nghiệm xem xe 3D tương tác thời gian thực, quản lý kho xe, đặt cọc giữ chỗ, đăng ký lái thử, tính toán trả góp và nghiệp vụ showroom.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Phía Khách Hàng (Public Showroom)
- **Trải nghiệm 3D Car**: Tương tác xem xe thể thao 3D mượt mà với Three.js / React Three Fiber.
- **Bộ sưu tập xe đa dạng**: Tìm kiếm, lọc nâng cao theo Hãng xe, Phân khúc (Sedan, SUV, EV), Tình trạng (Xe mới 100% / Xe lướt), Giá bán.
- **Chi tiết kỹ thuật xe**: Xem thông số động cơ, hộp số, dẫn động, số chỗ, màu sắc, số khung VIN, chính sách bảo hành và thư viện hình ảnh thực tế.
- **Đăng ký lái thử & Báo giá lăn bánh**: Form liên kết tự động tới đội ngũ tư vấn qua hệ thống Lead CRM.
- **Đa ngôn ngữ (i18n)**: Hỗ trợ linh hoạt Tiếng Việt (VI) và Tiếng Anh (EN).

### 2. Phía Quản Trị (Admin Dealership Portal)
- **Dashboard & Báo cáo**: Biểu đồ doanh thu, thống kê tồn kho, tỷ lệ chuyển đổi khách hàng tiềm năng.
- **Quản lý kho xe (Vehicles)**: CRUD thông tin xe, số khung VIN, tình trạng, giá niêm yết, phân loại hãng & phân khúc.
- **Quản lý Lead & Khách hàng**: Tiếp nhận và phân bổ nhân viên chăm sóc khách hàng đăng ký lái thử và mua xe.
- **Đặt cọc giữ chỗ (Deposits)**: Quản lý biên lai nhận cọc, trạng thái cọc và thời hạn giữ xe.
- **Báo giá (Quotations) & Hóa đơn (Invoices)**: Tính toán thuế trước bạ, phí đăng ký biển số, bảo hiểm và xuất hóa đơn.
- **Tư vấn tài chính & Trả góp (Finance)**: Thẩm định hồ sơ vay mua xe với ngân hàng liên kết.

---

## 🛠️ TECH STACK

- **Frontend**:
  - React 19 + Vite 8
  - TypeScript
  - Tailwind CSS 4
  - Three.js & React Three Fiber (@react-three/fiber, @react-three/drei)
  - GSAP (GreenSock) & Framer Motion
  - React Router DOM 7
  - Lucide React & Recharts
  - i18next & react-i18next

- **Backend**:
  - Node.js & Express 5
  - TypeScript (chạy trực tiếp qua `tsx`)
  - Prisma ORM 6
  - PostgreSQL (Neon Serverless PostgreSQL)
  - Bảo mật: Helmet, CORS, Express Rate Limit, Cookie-Parser, Zod validation
  - Multer upload ảnh

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 20.x trở lên
- **PostgreSQL**: Cơ sở dữ liệu PostgreSQL (hoặc Neon Database)

### 2. Cài đặt Dependencies

```bash
# Cài đặt cho Backend
cd server
npm install

# Cài đặt cho Frontend
cd ../client
npm install
```

### 3. Cấu hình Biến Môi Trường (Environment Variables)

Hệ thống đã chuẩn bị sẵn các file mẫu:
- Tại thư mục `server`: Sao chép `server/.env.example` thành `server/.env` và điền chuỗi kết nối Database:
  ```bash
  cd server
  cp .env.example .env
  ```
- Tại thư mục `client`: Sao chép `client/.env.example` thành `client/.env`:
  ```bash
  cd client
  cp .env.example .env
  ```

### 4. Đồng bộ Database & Dữ liệu mẫu (Seed Data)

```bash
cd server
# Đồng bộ Prisma schema vào database
npx prisma db push

# Nạp dữ liệu xe và danh mục mẫu
npm run db:seed
```

### 5. Khởi chạy ứng dụng

- **Khởi chạy Backend (Port 5000)**:
  ```bash
  cd server
  npm run dev
  ```

- **Khởi chạy Frontend (Port 5173)**:
  ```bash
  cd client
  npm run dev
  ```

👉 Mở trình duyệt và truy cập: **http://localhost:5173**

---

## 🔒 BẢO MẬT DỰ ÁN
- Toàn bộ file cấu hình chứa thông tin nhạy cảm (`.env`) đã được cấu hình trong `.gitignore` và không bao giờ được đưa lên kho mã nguồn Git.
- Sử dụng biến môi trường và file mẫu `.env.example` chuẩn hóa cho môi trường triển khai (Production / Staging).

---

## 👤 TÁC GIẢ
- **GitHub**: [@kieutanphuoc84tv](https://github.com/kieutanphuoc84tv)
- Dự án: **NEXUS AUTO Showroom**
