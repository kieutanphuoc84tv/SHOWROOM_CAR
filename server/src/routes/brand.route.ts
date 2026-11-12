import { Router } from 'express';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/brands - Khách hàng xem danh sách hãng xe (Public)
router.get('/', getBrands);

// ── CÁC ROUTE QUẢN TRỊ DƯỚI ĐÂY YÊU CẦU QUYỀN ADMIN ──
router.use(authenticate, requireAdmin);
router.post('/', createBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

export default router;
