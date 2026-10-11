import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import voucherRoutes from './src/routes/voucherRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_voucher_db')
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
