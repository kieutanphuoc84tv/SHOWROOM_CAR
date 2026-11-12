import { Router } from 'express';
import {
  getDeposits,
  createDeposit,
  updateDeposit,
  deleteDeposit,
} from '../controllers/deposit.controller';
import { authenticate, requireRoles, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Xem, tạo và cập nhật cọc: ADMIN & SALES
router.get('/', requireRoles(['ADMIN', 'SALES']), getDeposits);
router.post('/', requireRoles(['ADMIN', 'SALES']), createDeposit);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updateDeposit);

// Xóa phiếu cọc: Chỉ ADMIN
router.delete('/:id', requireAdmin, deleteDeposit);

export default router;
