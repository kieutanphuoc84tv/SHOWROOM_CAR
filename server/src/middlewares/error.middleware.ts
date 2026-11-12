import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);

  // Prisma errors handling
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[]) || [];
    return res.status(409).json({
      error: `Dữ liệu đã tồn tại trong hệ thống (${target.join(', ')})`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Bản ghi không tồn tại hoặc đã bị xóa',
    });
  }

  // Multer error handling
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Kích thước tệp vượt quá giới hạn cho phép (tối đa 10MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Số lượng tệp vượt quá giới hạn cho phép (tối đa 10 ảnh)' });
    }
    return res.status(400).json({ error: `Lỗi tải tệp: ${err.message}` });
  }

  // Production vs Development error formatting
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Đã xảy ra lỗi hệ thống nội bộ. Vui lòng thử lại sau.'
      : err.message || 'Lỗi hệ thống';

  console.error(`[Error] ${statusCode} - ${err.message}`);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

