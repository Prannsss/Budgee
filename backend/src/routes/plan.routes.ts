import { Router } from 'express';
import { getAllPlans, getPlanById, upgradePlan } from '../controllers/plan.controller';
import { authenticateToken, optionalAuth } from '../middlewares/auth.middleware';
import { idParamValidator } from '../utils/validators';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

// Public/optional auth routes
router.get('/', optionalAuth, getAllPlans);
router.get('/:id', validateRequest(idParamValidator), getPlanById);

// Protected routes
router.post('/upgrade', authenticateToken, upgradePlan);

export default router;
