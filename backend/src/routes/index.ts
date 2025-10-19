import { Router } from 'express';
import authRoutes from './auth.routes';
import planRoutes from './plan.routes';
import accountRoutes from './account.routes';
import transactionRoutes from './transaction.routes';
import categoryRoutes from './category.routes';
import dashboardRoutes from './dashboard.routes';
import savingsRoutes from './savings.routes';
import pinRoutes from './pin.routes';
import spendingLimitRoutes from './spending-limit.routes';

const router = Router(); // API Routes Configuration

// Base API route
router.get('/', (_, res) => {
  res.json({
    success: true,
    message: 'API base route active',
  });
});

// Health check
router.get('/health', (_, res) => {
  res.json({
    success: true,
    message: 'Budgee API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/savings', savingsRoutes);
router.use('/pin', pinRoutes);
router.use('/spending-limits', spendingLimitRoutes);

export default router;
