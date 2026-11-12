import { Router } from 'express';
import { listPromotions, getPromotion, createPromotion, updatePromotion, deletePromotion } from '../controllers/promotion.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createPromotionSchema, updatePromotionSchema } from '../validations/promotion.validation';

const router = Router();

// Public
router.get('/', listPromotions);
router.get('/:id', getPromotion);

// Admin
router.post('/', authenticate, requireAdmin, validateBody(createPromotionSchema), createPromotion);
router.put('/:id', authenticate, requireAdmin, validateBody(updatePromotionSchema), updatePromotion);
router.delete('/:id', authenticate, requireAdmin, deletePromotion);

export default router;
