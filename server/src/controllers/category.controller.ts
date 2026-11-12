import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { vehicles: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách loại xe' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên loại xe không được để trống' });
    const category = await prisma.category.create({
      data: { name: name.trim(), description: description?.trim() },
    });
    res.status(201).json({ message: 'Thêm loại xe thành công', category });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thêm loại xe' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const { name, description } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name: name?.trim(), description: description?.trim() },
    });
    res.json({ message: 'Cập nhật loại xe thành công', category });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật loại xe' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Xóa loại xe thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa loại xe (có thể đang có xe liên kết)' });
  }
};
