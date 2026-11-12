import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logAudit } from '../services/audit.service';

// ── GET /api/blogs — Public list (published only) ────────────
export const listBlogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const search = req.query.search as string | undefined;

    const where: any = { isPublished: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[listBlogs]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách blog' });
  }
};

// ── GET /api/blogs/:slug — Public detail ─────────────────────
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
    });
    if (!post || !post.isPublished) {
      return res.status(404).json({ error: 'Bài viết không tồn tại' });
    }
    res.json(post);
  } catch (error) {
    console.error('[getBlogBySlug]', error);
    res.status(500).json({ error: 'Lỗi khi lấy bài viết' });
  }
};

// ── POST /api/blogs — Admin create ───────────────────────────
export const createBlog = async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.blogPost.create({
      data: {
        ...req.body,
        authorId: req.user!.id,
        publishedAt: req.body.isPublished ? new Date() : null,
      },
    });
    await logAudit({ userId: req.user!.id, action: 'CREATE', entity: 'BlogPost', entityId: post.id });
    res.status(201).json(post);
  } catch (error) {
    console.error('[createBlog]', error);
    res.status(500).json({ error: 'Lỗi khi tạo bài viết' });
  }
};

// ── PUT /api/blogs/:id — Admin update ────────────────────────
export const updateBlog = async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logAudit({ userId: req.user!.id, action: 'UPDATE', entity: 'BlogPost', entityId: post.id });
    res.json(post);
  } catch (error) {
    console.error('[updateBlog]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật bài viết' });
  }
};

// ── DELETE /api/blogs/:id — Admin delete ─────────────────────
export const deleteBlog = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    await logAudit({ userId: req.user!.id, action: 'DELETE', entity: 'BlogPost', entityId: req.params.id });
    res.json({ message: 'Đã xóa bài viết' });
  } catch (error) {
    console.error('[deleteBlog]', error);
    res.status(500).json({ error: 'Lỗi khi xóa bài viết' });
  }
};

// ── PATCH /api/blogs/:id/publish — Toggle publish ────────────
export const togglePublish = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

    const isPublished = !existing.isPublished;
    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: { isPublished, publishedAt: isPublished ? new Date() : null },
    });
    res.json(post);
  } catch (error) {
    console.error('[togglePublish]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });
  }
};
