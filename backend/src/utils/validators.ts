import { body, param, query } from 'express-validator';

// ================================================
// Auth Validators
// ================================================

export const signupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+?63|0)?9\d{9}$/)
    .withMessage('Invalid Philippine phone number format'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ================================================
// Account Validators
// ================================================

export const createAccountValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ max: 100 })
    .withMessage('Account name must not exceed 100 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(['bank', 'e-wallet'])
    .withMessage('Account type must be either "bank" or "e-wallet"'),
  
  body('account_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Account number must not exceed 100 characters'),
  
  body('logo_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid logo URL'),
  
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance must be a positive number'),
];

export const updateAccountValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid account ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Account name must not exceed 100 characters'),
  
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance must be a positive number'),
];

// ================================================
// Transaction Validators
// ================================================

export const createTransactionValidator = [
  body('account_id')
    .notEmpty()
    .withMessage('Account ID is required')
    .isInt({ min: 1 })
    .withMessage('Invalid account ID'),
  
  body('category_id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isInt({ min: 1 })
    .withMessage('Invalid category ID'),
  
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['income', 'expense'])
    .withMessage('Transaction type must be either "income" or "expense"'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
];

export const updateTransactionValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid transaction ID'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
];

// ================================================
// Category Validators
// ================================================

export const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Category type is required')
    .isIn(['income', 'expense'])
    .withMessage('Category type must be either "income" or "expense"'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code'),
];

export const updateCategoryValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid category ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon must not exceed 50 characters'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code'),
];

// ================================================
// Generic Validators
// ================================================

export const idParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID parameter'),
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const dateRangeValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];
