import { Router } from 'express';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  verifyAccount,
  deleteAccount,
} from '../controllers/account.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createAccountValidator, updateAccountValidator, idParamValidator } from '../utils/validators';

const router = Router();

// All account routes require authentication
router.use(authenticateToken);

router.get('/', getAllAccounts);
router.get('/:id', validateRequest(idParamValidator), getAccountById);
router.post('/', validateRequest(createAccountValidator), createAccount);
router.put('/:id', validateRequest(updateAccountValidator), updateAccount);
router.post('/:id/verify', validateRequest(idParamValidator), verifyAccount);
router.delete('/:id', validateRequest(idParamValidator), deleteAccount);

export default router;
