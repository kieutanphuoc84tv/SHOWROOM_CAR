import { Router } from 'express';
import { listBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, togglePublish } from '../controllers/blog.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createBlogPostSchema, updateBlogPostSchema } from '../validations/blog.validation';

const router = Router();

// Public
router.get('/', listBlogs);
router.get('/:slug', getBlogBySlug);

// Admin
router.post('/', authenticate, requireAdmin, validateBody(createBlogPostSchema), createBlog);
router.put('/:id', authenticate, requireAdmin, validateBody(updateBlogPostSchema), updateBlog);
router.delete('/:id', authenticate, requireAdmin, deleteBlog);
router.patch('/:id/publish', authenticate, requireAdmin, togglePublish);

export default router;
