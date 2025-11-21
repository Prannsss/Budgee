import { Router } from 'express';
import { answerFinanceQuestion, aiHealthCheck } from '../controllers/ai.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * AI Routes
 * All routes require authentication
 */

// Health check (no auth required)
router.get('/health', aiHealthCheck);

// Answer finance questions (requires auth)
router.post('/ask', authenticateToken, answerFinanceQuestion);

export default router;
