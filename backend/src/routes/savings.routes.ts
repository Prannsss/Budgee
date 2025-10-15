import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import * as savingsController from '../controllers/savings.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/savings/allocations
 * @desc    Get all savings allocations for authenticated user
 * @access  Private
 */
router.get(
  '/allocations',
  savingsController.getAllAllocations
);

/**
 * @route   GET /api/savings/allocations/:id
 * @desc    Get single savings allocation
 * @access  Private
 */
router.get(
  '/allocations/:id',
  savingsController.getAllocationById
);

/**
 * @route   POST /api/savings/allocations
 * @desc    Create new savings allocation
 * @access  Private
 */
router.post(
  '/allocations',
  validateRequest([
    body('account_id').isInt().withMessage('Account ID must be an integer'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').isIn(['deposit', 'withdrawal']).withMessage('Type must be deposit or withdrawal'),
    body('description').notEmpty().isString().withMessage('Description is required'),
    body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  ]),
  savingsController.createAllocation
);

/**
 * @route   DELETE /api/savings/allocations/:id
 * @desc    Delete savings allocation
 * @access  Private
 */
router.delete(
  '/allocations/:id',
  validateRequest([
    param('id').isInt().withMessage('Allocation ID must be an integer'),
  ]),
  savingsController.deleteAllocation
);

/**
 * @route   GET /api/savings/total
 * @desc    Get total savings for user
 * @access  Private
 */
router.get(
  '/total',
  savingsController.getTotalSavings
);

export default router;
