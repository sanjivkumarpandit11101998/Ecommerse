/**
 * Validation Middleware
 */

const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const baseProductValidationRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Product slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must use lowercase letters, numbers and hyphens only'),
  body('basePrice').isFloat({ gt: 0 }).withMessage('basePrice must be greater than 0'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .withMessage('status must be ACTIVE, INACTIVE or DRAFT'),
  body('brandId').optional({ nullable: true }).isUUID().withMessage('brandId must be a valid UUID'),
  body('categoryId').optional({ nullable: true }).isUUID().withMessage('categoryId must be a valid UUID'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean')
];

// Create product validation rules (enforces multi-table insert payload)
const validateCreateProduct = [
  ...baseProductValidationRules,
  body('images')
    .isArray({ min: 1 })
    .withMessage('images is required and must contain at least one item'),
  body('images.*.imageUrl').isURL().withMessage('imageUrl must be a valid URL'),
  body('images.*.isPrimary').optional().isBoolean().withMessage('isPrimary must be boolean'),
  body('images.*.sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
  body('variants')
    .isArray({ min: 1 })
    .withMessage('variants is required and must contain at least one item'),
  body('variants.*.sku').trim().notEmpty().withMessage('variant sku is required'),
  body('variants.*.price').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('variant price must be greater than 0'),
  body('specifications')
    .isObject()
    .withMessage('specifications is required and must be a JSON object'),
  handleValidationErrors
];

// Update product validation rules
const validateProduct = [
  ...baseProductValidationRules,
  body('images').optional().isArray().withMessage('images must be an array'),
  body('images.*.imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL'),
  body('images.*.isPrimary').optional().isBoolean().withMessage('isPrimary must be boolean'),
  body('images.*.sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
  body('variants').optional().isArray().withMessage('variants must be an array'),
  body('variants.*.sku').optional().trim().notEmpty().withMessage('variant sku is required'),
  body('variants.*.price').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('variant price must be greater than 0'),
  body('specifications').optional().isObject().withMessage('specifications must be a JSON object'),
  handleValidationErrors
];

// Product review validation rules
const validateReview = [
  body('userId').isUUID().withMessage('userId must be a valid UUID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be an integer between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 2000 }).withMessage('comment must be a string with max 2000 characters'),
  handleValidationErrors
];

// User registration validation rules
const validateRegister = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  handleValidationErrors
];

// User login validation rules
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  validateProduct,
  validateCreateProduct,
  validateReview,
  validateRegister,
  validateLogin,
  handleValidationErrors
};
