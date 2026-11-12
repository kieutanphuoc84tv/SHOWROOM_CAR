import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getBrands = async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { vehicles: true } } },
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách hãng xe' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, country, logoUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên hãng xe không được để trống' });
    const brand = await prisma.brand.create({ data: { name: name.trim(), country: country?.trim(), logoUrl } });
    res.status(201).json({ message: 'Thêm hãng xe thành công', brand });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thêm hãng xe' });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    const { name, country, logoUrl } = req.body;
    const brand = await prisma.brand.update({
      where: { id },
      data: { name: name?.trim(), country: country?.trim(), logoUrl },
    });
    res.json({ message: 'Cập nhật hãng xe thành công', brand });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật hãng xe' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));
    await prisma.brand.delete({ where: { id } });
    res.json({ message: 'Xóa hãng xe thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa hãng xe (có thể đang có xe liên kết)' });
  }
};
