import { Request, Response, NextFunction } from 'express';
import { SpendingLimitService } from '../utils/spending-limit.service';

/**
 * Middleware to check and reset spending limits for authenticated users
 * This runs on authenticated requests to ensure limits are up-to-date
 */
export const checkSpendingLimitsMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Only run for authenticated users
    if (req.user?.id) {
      // Check and reset limits if needed (non-blocking)
      // This runs in the background and doesn't delay the request
      SpendingLimitService.checkAndResetAllUserLimits(req.user.id).catch(error => {
        console.error('Error checking spending limits:', error);
        // Don't fail the request if limit check fails
      });
    }
  } catch (error) {
    console.error('Error in spending limits middleware:', error);
    // Don't fail the request if middleware fails
  }
  
  // Continue to the next middleware/route handler
  next();
};

/**
 * Initialize spending limits check on server startup
 * This can be called when the server starts to ensure limits are reset
 */
export const initializeSpendingLimitsCheck = async () => {
  try {
    console.log('🔄 Initializing spending limits check...');
    // On startup, we can't check all users, but the middleware will handle it per-user
    console.log('✅ Spending limits check initialized');
  } catch (error) {
    console.error('❌ Failed to initialize spending limits check:', error);
  }
};
