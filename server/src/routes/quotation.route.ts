import { Router } from 'express';
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from '../controllers/quotation.controller';
import { authenticate, requireRoles, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Xem, tạo, sửa báo giá: ADMIN & SALES
router.get('/', requireRoles(['ADMIN', 'SALES']), getQuotations);
router.post('/', requireRoles(['ADMIN', 'SALES']), createQuotation);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updateQuotation);

// Xóa báo giá: Chỉ ADMIN
router.delete('/:id', requireAdmin, deleteQuotation);

export default router;
