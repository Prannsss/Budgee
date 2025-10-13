import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  createTransactionValidator,
  updateTransactionValidator,
  idParamValidator,
  paginationValidator,
  dateRangeValidator,
} from '../utils/validators';

const router = Router();

// All transaction routes require authentication
router.use(authenticateToken);

router.get('/', validateRequest([...paginationValidator, ...dateRangeValidator]), getAllTransactions);
router.get('/:id', validateRequest(idParamValidator), getTransactionById);
router.post('/', validateRequest(createTransactionValidator), createTransaction);
router.put('/:id', validateRequest(updateTransactionValidator), updateTransaction);
router.delete('/:id', validateRequest(idParamValidator), deleteTransaction);

export default router;
