import { Router } from 'express';
import {
  getDashboardSummary,
  getSpendingByCategory,
  getIncomeBySource,
} from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

router.get('/', getDashboardSummary);
router.get('/spending-by-category', getSpendingByCategory);
router.get('/income-by-source', getIncomeBySource);

export default router;
