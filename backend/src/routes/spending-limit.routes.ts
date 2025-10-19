import { Router } from 'express';
import {
  getSpendingLimits,
  getSpendingLimitStatus,
  updateSpendingLimit,
  resetSpendingLimits,
  checkSpendingLimit,
  getSpendingTrends,
} from '../controllers/spending-limit.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/spending-limits
 * @desc    Get all spending limits for authenticated user
 * @access  Private
 */
router.get('/', getSpendingLimits);

/**
 * @route   GET /api/spending-limits/status
 * @desc    Get spending limit status with warnings and exceeded flags
 * @access  Private
 */
router.get('/status', getSpendingLimitStatus);

/**
 * @route   GET /api/spending-limits/trends
 * @desc    Get spending trends over time
 * @access  Private
 */
router.get('/trends', getSpendingTrends);

/**
 * @route   PUT /api/spending-limits/:type
 * @desc    Update a specific spending limit (Daily, Weekly, or Monthly)
 * @access  Private
 */
router.put('/:type', updateSpendingLimit);

/**
 * @route   POST /api/spending-limits/reset
 * @desc    Reset spending limits (for testing or manual reset)
 * @access  Private
 */
router.post('/reset', resetSpendingLimits);

/**
 * @route   POST /api/spending-limits/check
 * @desc    Check if a transaction would exceed spending limits
 * @access  Private
 */
router.post('/check', checkSpendingLimit);

export default router;
