import { Router } from 'express';
import {
  getFinanceApplications,
  createFinanceApplication,
  updateFinanceApplication,
  deleteFinanceApplication,
} from '../controllers/finance.controller';
import { authenticate, requireRoles, requireAdmin } from '../middlewares/auth.middleware';
import { publicFormLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Khách hàng gửi hồ sơ tư vấn trả góp (Public, Rate Limiting)
router.post('/', publicFormLimiter, createFinanceApplication);

// Quản trị viên và Nhân viên bán hàng xử lý hồ sơ
router.use(authenticate);
router.get('/', requireRoles(['ADMIN', 'SALES']), getFinanceApplications);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updateFinanceApplication);

// Xóa hồ sơ trả góp: Chỉ ADMIN
router.delete('/:id', requireAdmin, deleteFinanceApplication);

export default router;
