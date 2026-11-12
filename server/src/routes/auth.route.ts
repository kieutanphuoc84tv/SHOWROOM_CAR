import { Router } from 'express';
import { login, getMe, logout } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema } from '../validations/auth.validation';

const router = Router();

// Endpoint: POST /api/auth/login
router.post('/login', login);
// Endpoint: GET /api/auth/me
router.get('/me', getMe);
// Endpoint: POST /api/auth/logout
// POST /api/auth/login - Đăng nhập có Rate Limit chống brute-force và Validate dữ liệu
router.post('/login', authLimiter, validateBody(loginSchema), login);

// GET /api/auth/me - Lấy thông tin user hiện tại (bảo vệ bằng authenticate)
router.get('/me', authenticate, getMe);

// POST /api/auth/logout - Đăng xuất và xóa cookie
router.post('/logout', logout);

export default router;
