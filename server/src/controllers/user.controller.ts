import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách nhân viên' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, role } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        passwordHash,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        role: role || 'SALES',
      },
      select: { id: true, email: true, fullName: true, role: true },
    });
    res.status(201).json({ message: 'Tạo tài khoản thành công', user });
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(400).json({ error: 'Email đã tồn tại trong hệ thống' });
    res.status(500).json({ error: 'Lỗi khi tạo tài khoản' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { fullName, phone, role, isActive, password } = req.body;
    const data: any = {};
    if (fullName) data.fullName = fullName.trim();
    if (phone !== undefined) data.phone = phone ? phone.trim() : null;
    if (role) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
    res.json({ message: 'Cập nhật tài khoản thành công', user });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi cập nhật tài khoản' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Xóa tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa tài khoản' });
  }
};
