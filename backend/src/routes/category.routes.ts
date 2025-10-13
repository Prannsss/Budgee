import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createCategoryValidator, updateCategoryValidator, idParamValidator } from '../utils/validators';

const router = Router();

// All category routes require authentication
router.use(authenticateToken);

router.get('/', getAllCategories);
router.get('/:id', validateRequest(idParamValidator), getCategoryById);
router.post('/', validateRequest(createCategoryValidator), createCategory);
router.put('/:id', validateRequest(updateCategoryValidator), updateCategory);
router.delete('/:id', validateRequest(idParamValidator), deleteCategory);

export default router;
