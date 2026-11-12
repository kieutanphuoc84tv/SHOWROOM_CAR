import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Dashboard chỉ dành cho Quản trị viên (ADMIN) và Nhân viên bán hàng (SALES)
router.use(authenticate, requireRoles(['ADMIN', 'SALES']));
router.get('/stats', getDashboardStats);

export default router;
