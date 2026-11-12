import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/categories - Khách hàng xem danh mục xe (Public)
router.get('/', getCategories);

// ── CÁC ROUTE QUẢN TRỊ DƯỚI ĐÂY YÊU CẦU QUYỀN ADMIN ──
router.use(authenticate, requireAdmin);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
