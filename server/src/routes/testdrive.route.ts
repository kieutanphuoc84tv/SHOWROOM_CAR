import { Router } from 'express';
import {
  getTestDrives,
  createTestDrive,
  updateTestDrive,
  deleteTestDrive,
} from '../controllers/testdrive.controller';
import { authenticate, requireRoles, requireAdmin } from '../middlewares/auth.middleware';
import { publicFormLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Khách hàng đặt lịch lái thử xe (Public, Rate Limiting)
router.post('/', publicFormLimiter, createTestDrive);

// Quản trị viên và Nhân viên bán hàng quản lý lịch lái thử
router.use(authenticate);
router.get('/', requireRoles(['ADMIN', 'SALES']), getTestDrives);
router.put('/:id', requireRoles(['ADMIN', 'SALES']), updateTestDrive);

// Xóa lịch lái thử: Chỉ ADMIN
router.delete('/:id', requireAdmin, deleteTestDrive);

export default router;
