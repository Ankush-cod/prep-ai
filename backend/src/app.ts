// src/app.ts
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, serviceStatus } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimiter';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import codingRoutes from './routes/coding.routes';
import companyQuestionRoutes from './routes/companyQuestion.routes';
import dashboardRoutes from './routes/dashboard.routes';
import interviewRoutes from './routes/interview.routes';
import profileRoutes from './routes/profile.routes';
import resourceRoutes from './routes/resource.routes';
import resumeRoutes from './routes/resume.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();

const rawClientUrls = env.clientUrl || 'http://localhost:3000';
const allowedOrigins = rawClientUrls
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!requestOrigin) {
        return callback(null, true);
      }
      const normalized = requestOrigin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized) || !env.isProduction) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${requestOrigin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

app.use('/api', generalRateLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'prepai-backend',
    timestamp: new Date().toISOString(),
    integrations: serviceStatus,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/company-questions', companyQuestionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
