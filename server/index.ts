// Backend API Server - Express + Prisma
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import integrationRoutes from './routes/integrations';
import analyticsRoutes from './routes/analytics';
import activityRoutes from './routes/activity';
import billingRoutes from './routes/billing';
import aiRoutes from './routes/ai';
import apiKeyRoutes from './routes/apiKeys';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/integrations', authenticateToken, integrationRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/activity', authenticateToken, activityRoutes);
app.use('/api/billing', authenticateToken, billingRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/api-keys', authenticateToken, apiKeyRoutes);

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs at http://localhost:${PORT}/api/docs`);
});

export { app, prisma };
