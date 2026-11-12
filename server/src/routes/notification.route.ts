import { Router } from 'express';
import { listNotifications, unreadCount, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // Tất cả cần đăng nhập

router.get('/', listNotifications);
router.get('/unread-count', unreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
