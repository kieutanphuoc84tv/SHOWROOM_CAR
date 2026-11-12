import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.join(__dirname, '../../public/uploads');

// Đảm bảo thư mục public/uploads luôn tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/jpg',
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, AVIF'
      )
    );
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Tối đa 10MB mỗi file
    files: 10, // Tối đa 10 file mỗi lần tải lên
  },
});
