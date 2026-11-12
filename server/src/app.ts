import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import compression from 'compression';

import { apiLimiter } from './middlewares/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

import authRoutes from './routes/auth.route';
import leadRoutes from './routes/lead.route';
import vehicleRoutes from './routes/vehicle.route';
import dashboardRoutes from './routes/dashboard.route';
import testdriveRoutes from './routes/testdrive.route';
import financeRoutes from './routes/finance.route';
import paymentRoutes from './routes/payment.route';
import brandRoutes from './routes/brand.route';
import categoryRoutes from './routes/category.route';
import userRoutes from './routes/user.route';
import depositRoutes from './routes/deposit.route';
import quotationRoutes from './routes/quotation.route';
import invoiceRoutes from './routes/invoice.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── 1. Security Headers (Helmet) ──────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// ── 2. CORS Configuration ─────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Yêu cầu bị chặn bởi chính sách CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ── 3. Performance & Body Parsing ─────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static file serving cho uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── 4. Global Rate Limiter ────────────────────────────────────
app.use('/api', apiLimiter);

// ── 5. Health Check Route ─────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Nexus Auto Dealership API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── 6. Domain Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/test-drives', testdriveRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);

// ── 7. Centralized Error & 404 Handlers ───────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── 8. Start Server ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚗 Nexus Auto API running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
