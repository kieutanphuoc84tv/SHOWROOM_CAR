import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa hoặc khóa tạm thời' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const secret = process.env.JWT_SECRET || 'nexus-auto-secret-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn: expiresIn as any }
    );

    const { passwordHash, ...userWithoutPassword } = user;

    // Gắn token vào HTTP-Only Cookie an toàn
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Trả về cả token trong body để client có thể linh hoạt dùng header hoặc cookie
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('[login] Error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi xử lý đăng nhập' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Chưa xác thực danh tính' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    res.json({ user });
  } catch (error) {
    console.error('[getMe] Error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy thông tin người dùng' });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Đăng xuất thành công' });
};
