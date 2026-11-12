import { Router } from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  deleteVehicle,
  updateVehicle,
} from '../controllers/vehicle.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { uploadImages } from '../middlewares/upload.middleware';

const router = Router();

// GET /api/vehicles - Khách hàng xem danh sách xe (Public, hỗ trợ lọc & phân trang)
router.get('/', getVehicles);

// GET /api/vehicles/:id - Xem chi tiết một xe (Public)
router.get('/:id', getVehicleById);

// ── CÁC ROUTE QUẢN TRỊ DƯỚI ĐÂY BẮT BUỘC ĐĂNG NHẬP VÀ CÓ QUYỀN ADMIN ──
router.use(authenticate, requireAdmin);

// POST /api/vehicles - Admin thêm xe mới (Upload tối đa 10 ảnh)
router.post('/', uploadImages.array('images', 10), createVehicle);

// PUT /api/vehicles/:id - Admin cập nhật thông tin & ảnh xe
router.put('/:id', uploadImages.array('images', 10), updateVehicle);

// DELETE /api/vehicles/:id - Admin xóa xe (Soft delete an toàn)
router.delete('/:id', deleteVehicle);

export default router;
