import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { isAdmin, verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { writeRateLimiter } from './middleware/rateLimiters.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import netWorthRoutes from './routes/netWorthRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.disable('x-powered-by');
if (env.nodeEnv === 'production') app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.clientUrl) {
        return callback(null, true);
      }

      const error = new Error('Origin is not allowed by CORS policy');
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use('/api', writeRateLimiter);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb', parameterLimit: 100 }));
app.use(cookieParser());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/income', verifyToken, incomeRoutes);
app.use('/api/expenses', verifyToken, expenseRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/habits', verifyToken, habitRoutes);
app.use('/api/goals', verifyToken, goalRoutes);
app.use('/api/assets', verifyToken, assetRoutes);
app.use('/api/networth', verifyToken, netWorthRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/feedback', verifyToken, feedbackRoutes);
app.use('/api/admin', verifyToken, isAdmin, adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
