import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'SALES' | 'USER';
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    // Hỗ trợ đọc cả Bearer Token từ Header Authorization (cho Mobile/Postman/Integration)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Truy cập bị từ chối: Chưa đăng nhập' });
    }

    const secret = process.env.JWT_SECRET || 'nexus-auto-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as { userId: string; role: 'ADMIN' | 'SALES' | 'USER' };

    // Kiểm tra trực tiếp Database: Đảm bảo User còn tồn tại và KHÔNG bị vô hiệu hóa
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Tài khoản người dùng không còn tồn tại' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa tạm thời' });
    }

    // Đính kèm thông tin user đã xác thực vào request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Bạn không có quyền thực hiện hành động này. Yêu cầu quyền Quản trị viên (ADMIN)',
    });
  }
  next();
};

export const requireRoles = (allowedRoles: Array<'ADMIN' | 'SALES' | 'USER'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Quyền truy cập bị từ chối. Hành động này chỉ dành cho: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
};
