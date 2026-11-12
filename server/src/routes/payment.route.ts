import { Router } from 'express';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/payment.controller';
import { authenticate, requireRoles, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Xem, tạo, cập nhật thanh toán: ADMIN & SALES
router.get('/', requireRoles(['ADMIN', 'SALES']), getPayments);
router.post('/', requireRoles(['ADMIN', 'SALES']), createPayment);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updatePayment);

// Xóa giao dịch thanh toán: Chỉ ADMIN
router.delete('/:id', requireAdmin, deletePayment);

export default router;
