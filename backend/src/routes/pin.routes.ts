import { Router } from 'express';
import * as pinController from '../controllers/pin.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All PIN routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/pin/status
 * @desc    Check if user has PIN enabled
 * @access  Private
 */
router.get('/status', pinController.getPinStatus);

/**
 * @route   POST /api/pin/setup
 * @desc    Set up new PIN
 * @access  Private
 */
router.post('/setup', pinController.setupPin);

/**
 * @route   POST /api/pin/verify
 * @desc    Verify PIN
 * @access  Private
 */
router.post('/verify', pinController.verifyPin);

/**
 * @route   PUT /api/pin/change
 * @desc    Change existing PIN
 * @access  Private
 */
router.put('/change', pinController.changePin);

/**
 * @route   POST /api/pin/disable
 * @desc    Disable PIN (keeps it stored but inactive)
 * @access  Private
 */
router.post('/disable', pinController.disablePin);

/**
 * @route   POST /api/pin/enable
 * @desc    Re-enable previously disabled PIN
 * @access  Private
 */
router.post('/enable', pinController.enablePin);

/**
 * @route   DELETE /api/pin
 * @desc    Remove PIN completely
 * @access  Private
 */
router.delete('/', pinController.removePin);

export default router;
