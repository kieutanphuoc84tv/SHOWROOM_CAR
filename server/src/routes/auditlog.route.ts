import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditlog.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, requireAdmin, listAuditLogs);

export default router;
