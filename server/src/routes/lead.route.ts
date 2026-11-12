import { Router } from 'express';
import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} from '../controllers/lead.controller';
import { authenticate, requireRoles, requireAdmin } from '../middlewares/auth.middleware';
import { publicFormLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Khách hàng gửi thông tin tư vấn (Public, có Rate Limiting chống spam)
router.post('/', publicFormLimiter, createLead);

// Quản trị viên và Nhân viên bán hàng xem & cập nhật Lead
router.use(authenticate);
router.get('/', requireRoles(['ADMIN', 'SALES']), getLeads);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updateLead);

// Xóa Lead: Chỉ ADMIN
router.delete('/:id', requireAdmin, deleteLead);

export default router;
