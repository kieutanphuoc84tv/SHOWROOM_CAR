import { Router } from 'express';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoice.controller';
import { authenticate, requireRoles, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Xem, tạo, sửa hóa đơn: ADMIN & SALES
router.get('/', requireRoles(['ADMIN', 'SALES']), getInvoices);
router.post('/', requireRoles(['ADMIN', 'SALES']), createInvoice);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updateInvoice);

// Xóa hóa đơn: Chỉ ADMIN
router.delete('/:id', requireAdmin, deleteInvoice);

export default router;
