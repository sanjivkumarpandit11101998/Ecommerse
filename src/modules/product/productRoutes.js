const express = require('express');
const router = express.Router();
const productController = require('./controller/ProductController');
const reviewController = require('./controller/ReviewController');
const { authenticate, isAdmin } = require('../../middleware/auth');
const { validateProduct, validateCreateProduct, validateReview } = require('../../middleware/validator');

/**
 * @openapi
 * components:
 *   schemas:
 *     ProductImage:
 *       type: object
 *       properties:
 *         imageUrl:
 *           type: string
 *           format: uri
 *         isPrimary:
 *           type: boolean
 *         sortOrder:
 *           type: integer
 *     ProductVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         sku:
 *           type: string
 *         attributeName:
 *           type: string
 *           nullable: true
 *         attributeValue:
 *           type: string
 *           nullable: true
 *         attributes:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           nullable: true
 *         price:
 *           type: number
 *           format: float
 *           nullable: true
 *     ProductPayload:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *         - basePrice
 *       properties:
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         shortDescription:
 *           type: string
 *         description:
 *           type: string
 *         basePrice:
 *           type: number
 *           format: float
 *         brandId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         categoryId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DRAFT]
 *         isFeatured:
 *           type: boolean
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 *         specifications:
 *           type: object
 *     ProductResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ProductPayload'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             brandName:
 *               type: string
 *               nullable: true
 *             categoryName:
 *               type: string
 *               nullable: true
 *             averageRating:
 *               type: number
 *               format: float
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *     ProductListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         primaryImage:
 *           type: string
 *           format: uri
 *           nullable: true
 *         amount:
 *           type: number
 *           format: float
 *         rating:
 *           type: number
 *           format: float
 *         variant:
 *           allOf:
 *             - $ref: '#/components/schemas/ProductVariant'
 *           nullable: true
 *     ProductListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductListItem'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *     ProductSingleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/ProductResponse'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get a list of products
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DRAFT]
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: variantSku
 *         description: Exact variant SKU match
 *         schema:
 *           type: string
 *       - in: query
 *         name: variantMinPrice
 *         description: Minimum variant price (falls back to base product price if variant price is null)
 *         schema:
 *           type: number
 *       - in: query
 *         name: variantMaxPrice
 *         description: Maximum variant price (falls back to base product price if variant price is null)
 *         schema:
 *           type: number
 *       - in: query
 *         name: color
 *         description: Shortcut for variant attribute Color
 *         schema:
 *           type: string
 *       - in: query
 *         name: storage
 *         description: Shortcut for variant attribute Storage
 *         schema:
 *           type: string
 *       - in: query
 *         name: ram
 *         description: Shortcut for variant attribute RAM
 *         schema:
 *           type: string
 *       - in: query
 *         name: variantAttributes
 *         description: JSON object string for variant attribute filters. Example {"Color":"Black","Storage":"256GB"}
 *         schema:
 *           type: string
 *       - in: query
 *         name: variantAttr.<name>
 *         description: Dynamic attribute filter key. Examples variantAttr.Color=Black or variantAttr[Color]=Black
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: specifications
 *         description: JSON object string for JSONB contains filter. Example {"Display":{"Size":"6.7 inch"}}
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name, basePrice, averageRating]
 *       - in: query
 *         name: sortOrder
 *         description: Sort direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 99999999-9999-4999-8999-999999999999
 *                   name: Samsung Galaxy S25
 *                   slug: samsung-galaxy-s25
 *                   primaryImage: https://cdn.example.com/products/s25-front.jpg
 *                   amount: 79999
 *                   rating: 4.8
 *                   variant:
 *                     id: 22222222-2222-4222-8222-222222222222
 *                     sku: S25-128GB
 *                     attributeName: Storage
 *                     attributeValue: 128GB
 *                     attributes:
 *                       Storage: 128GB
 *                     price: 79999
 *                 - id: 99999999-9999-4999-8999-999999999999
 *                   name: Samsung Galaxy S25
 *                   slug: samsung-galaxy-s25
 *                   primaryImage: https://cdn.example.com/products/s25-front.jpg
 *                   amount: 84999
 *                   rating: 4.8
 *                   variant:
 *                     id: 33333333-3333-4333-8333-333333333333
 *                     sku: S25-256GB
 *                     attributeName: Storage
 *                     attributeValue: 256GB
 *                     attributes:
 *                       Storage: 256GB
 *                     price: 84999
 *               pagination:
 *                 total: 12
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 2
 *   post:
 *     summary: Create a new product
 *     description: Creates a product and related records in product_image, product_variant and product_specification.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductPayload'
 *           example:
 *             name: Samsung Galaxy S25
 *             slug: samsung-galaxy-s25
 *             shortDescription: Latest Samsung flagship phone
 *             description: Samsung Galaxy S25 with AMOLED display and flagship chipset.
 *             basePrice: 79999
*             brandId: aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
*             categoryId: 11111111-1111-4111-8111-111111111111
 *             status: ACTIVE
 *             isFeatured: true
 *             images:
 *               - imageUrl: https://cdn.example.com/products/s25-front.jpg
 *                 isPrimary: true
 *                 sortOrder: 1
 *               - imageUrl: https://cdn.example.com/products/s25-back.jpg
 *                 isPrimary: false
 *                 sortOrder: 2
 *             variants:
 *               - sku: S25-128GB
 *                 attributeName: Storage
 *                 attributeValue: 128GB
 *                 price: 79999
 *               - sku: S25-256GB
 *                 attributeName: Storage
 *                 attributeValue: 256GB
 *                 price: 84999
 *             specifications:
 *               Display:
 *                 Size: 6.7 inch
 *                 RefreshRate: 120Hz
 *               Battery:
 *                 Capacity: 5000mAh
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductSingleResponse'
 *             example:
 *               success: true
 *               data:
*                 id: 99999999-9999-4999-8999-999999999999
 *                 name: Samsung Galaxy S25
 *                 slug: samsung-galaxy-s25
 *                 basePrice: 79999
 *                 status: ACTIVE
 *                 isFeatured: true
 *                 images:
 *                   - imageUrl: https://cdn.example.com/products/s25-front.jpg
 *                     isPrimary: true
 *                     sortOrder: 1
 *                 variants:
 *                   - sku: S25-128GB
 *                     attributeName: Storage
 *                     attributeValue: 128GB
 *                     price: 79999
 *                 specifications:
 *                   Battery:
 *                     Capacity: 5000mAh
 *       400:
 *         description: Validation failed or duplicate slug/sku
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to create product: variants is required and must contain at least one item"
 *
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductSingleResponse'
 *             example:
 *               success: true
 *               data:
*                 id: 99999999-9999-4999-8999-999999999999
 *                 name: Samsung Galaxy S25
 *                 slug: samsung-galaxy-s25
 *                 basePrice: 79999
 *                 status: ACTIVE
 *                 isFeatured: true
 *                 images:
 *                   - imageUrl: https://cdn.example.com/products/s25-front.jpg
 *                     isPrimary: true
 *                     sortOrder: 1
 *                 variants:
*                   - id: 22222222-2222-4222-8222-222222222222
 *                     sku: S25-128GB
 *                     attributeName: Storage
 *                     attributeValue: 128GB
 *                     price: 79999
 *                 specifications:
 *                   Display:
 *                     Size: 6.7 inch
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to fetch product: Product not found"
 *   put:
 *     summary: Update a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductPayload'
 *           example:
 *             name: Samsung Galaxy S25 Ultra
 *             slug: samsung-galaxy-s25-ultra
 *             basePrice: 99999
 *             status: ACTIVE
 *             isFeatured: true
 *             images:
 *               - imageUrl: https://cdn.example.com/products/s25-ultra-front.jpg
 *                 isPrimary: true
 *                 sortOrder: 1
 *             variants:
 *               - sku: S25U-256GB
 *                 attributeName: Storage
 *                 attributeValue: 256GB
 *                 price: 99999
 *             specifications:
 *               Camera:
 *                 Main: 200MP
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductSingleResponse'
 *             example:
 *               success: true
 *               data:
*                 id: 99999999-9999-4999-8999-999999999999
 *                 name: Samsung Galaxy S25 Ultra
 *                 slug: samsung-galaxy-s25-ultra
 *                 basePrice: 99999
 *                 status: ACTIVE
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to update product: Product not found"
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Product marked as deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               message: Product marked as deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to delete product: Product not found"
 *
 * /api/products/{id}/reviews:
 *   get:
 *     summary: Get reviews for a product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 77777777-7777-4777-8777-777777777777
 *                   productId: 99999999-9999-4999-8999-999999999999
 *                   userId: 44444444-4444-4444-8444-444444444444
 *                   rating: 5
 *                   comment: Great product
 *                   createdAt: 2026-02-23T10:00:00.000Z
 *   post:
 *     summary: Create a review for a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - rating
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *           example:
 *             userId: 44444444-4444-4444-8444-444444444444
 *             rating: 5
 *             comment: Great product
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 77777777-7777-4777-8777-777777777777
 *                 productId: 99999999-9999-4999-8999-999999999999
 *                 userId: 44444444-4444-4444-8444-444444444444
 *                 rating: 5
 *                 comment: Great product
 *                 createdAt: 2026-02-23T10:00:00.000Z
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation failed
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to create product review: Product not found"
 *
 * /api/products/{id}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review for a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the product
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the review
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Review deleted successfully
 *       404:
 *         description: Product or review not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to delete product review: Review not found"
 */

// Public routes
router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));
router.get('/:id/reviews', reviewController.getProductReviews.bind(reviewController));

// Protected routes (admin only)
// router.post('/', authenticate, isAdmin, validateCreateProduct, productController.createProduct.bind(productController));
router.post('/', validateCreateProduct, productController.createProduct.bind(productController));
router.put('/:id', authenticate, isAdmin, validateProduct, productController.updateProduct.bind(productController));
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct.bind(productController));
router.post('/:id/reviews', authenticate, validateReview, reviewController.createProductReview.bind(reviewController));
router.delete('/:id/reviews/:reviewId', authenticate, reviewController.deleteProductReview.bind(reviewController));

module.exports = router;
