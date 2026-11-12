import rateLimit from 'express-rate-limit';

// Giới hạn chung cho toàn bộ API (chống DDoS / Scraper càn quét)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 300, // Tối đa 300 requests mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.',
  },
});

// Giới hạn đăng nhập nghiêm ngặt (chống Brute-force password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 10, // Tối đa 10 lần thử đăng nhập
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Quá nhiều lần thử đăng nhập không thành công. Vui lòng thử lại sau 15 phút.',
  },
});

// Giới hạn gửi form công khai (chống spam Leads / Lịch lái thử)
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Bạn đã gửi quá nhiều yêu cầu tư vấn. Vui lòng thử lại sau 15 phút.',
  },
});

