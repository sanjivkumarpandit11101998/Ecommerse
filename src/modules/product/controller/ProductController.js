/**
 * Product Controller
 * Presentation Layer - Handles HTTP requests for Product operations
 */

const productService = require('../service/ProductService');

class ProductController {
  _parseSorting(rawSortBy, rawSortOrder) {
    if (rawSortBy === undefined && rawSortOrder === undefined) {
      return {};
    }

    const allowedSortFields = new Set([
      'createdAt',
      'updatedAt',
      'name',
      'basePrice',
      'averageRating'
    ]);

    if (rawSortBy !== undefined && !allowedSortFields.has(rawSortBy)) {
      throw new Error('Invalid sortBy. Allowed values: createdAt, updatedAt, name, basePrice, averageRating');
    }

    if (rawSortOrder !== undefined) {
      const normalizedOrder = String(rawSortOrder).toLowerCase();
      if (!['asc', 'desc'].includes(normalizedOrder)) {
        throw new Error('Invalid sortOrder. Allowed values: asc, desc');
      }
      return {
        sortBy: rawSortBy,
        sortOrder: normalizedOrder
      };
    }

    return {
      sortBy: rawSortBy
    };
  }

  _parseSpecificationsFilter(rawSpecifications) {
    if (rawSpecifications === undefined) return undefined;

    if (typeof rawSpecifications === 'object' && rawSpecifications !== null && !Array.isArray(rawSpecifications)) {
      return rawSpecifications;
    }

    if (typeof rawSpecifications === 'string') {
      try {
        const parsed = JSON.parse(rawSpecifications);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('specifications must be a JSON object');
        }
        return parsed;
      } catch (error) {
        throw new Error('Invalid specifications filter. Pass a valid JSON object.');
      }
    }

    throw new Error('Invalid specifications filter. Pass a valid JSON object.');
  }

  _parseVariantAttributesFilter(rawVariantAttributes) {
    if (rawVariantAttributes === undefined) return undefined;

    if (typeof rawVariantAttributes === 'object' && rawVariantAttributes !== null && !Array.isArray(rawVariantAttributes)) {
      return rawVariantAttributes;
    }

    if (typeof rawVariantAttributes === 'string') {
      try {
        const parsed = JSON.parse(rawVariantAttributes);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('variantAttributes must be a JSON object');
        }
        return parsed;
      } catch (error) {
        throw new Error('Invalid variantAttributes filter. Pass a valid JSON object.');
      }
    }

    throw new Error('Invalid variantAttributes filter. Pass a valid JSON object.');
  }

  _extractVariantAttributesFromQuery(query = {}) {
    const variantAttributes = {};

    if (query.variantAttr && typeof query.variantAttr === 'object' && !Array.isArray(query.variantAttr)) {
      for (const [attributeName, value] of Object.entries(query.variantAttr)) {
        const normalizedAttributeName = String(attributeName).trim();
        if (!normalizedAttributeName) continue;
        if (value === undefined || value === null || String(value).trim().length === 0) continue;
        variantAttributes[normalizedAttributeName] = String(value).trim();
      }
    }

    for (const [key, value] of Object.entries(query)) {
      let attributeName = '';
      if (key.startsWith('variantAttr.')) {
        attributeName = key.slice('variantAttr.'.length).trim();
      } else if (key.startsWith('variantAttr[') && key.endsWith(']')) {
        attributeName = key.slice('variantAttr['.length, -1).trim();
      } else {
        continue;
      }

      if (!attributeName) continue;
      if (value === undefined || value === null || String(value).trim().length === 0) continue;

      variantAttributes[attributeName] = String(value).trim();
    }

    return variantAttributes;
  }

  _buildVariantAttributesFilter(rawVariantAttributes, rawColor, rawStorage, rawRam, query) {
    const parsedVariantAttributes = this._parseVariantAttributesFilter(rawVariantAttributes);
    const mergedAttributes = parsedVariantAttributes ? { ...parsedVariantAttributes } : {};

    if (rawColor !== undefined && String(rawColor).trim().length > 0) {
      mergedAttributes.Color = String(rawColor).trim();
    }

    if (rawStorage !== undefined && String(rawStorage).trim().length > 0) {
      mergedAttributes.Storage = String(rawStorage).trim();
    }

    if (rawRam !== undefined && String(rawRam).trim().length > 0) {
      mergedAttributes.RAM = String(rawRam).trim();
    }

    const dynamicVariantAttributes = this._extractVariantAttributesFromQuery(query);
    Object.assign(mergedAttributes, dynamicVariantAttributes);

    return Object.keys(mergedAttributes).length > 0 ? mergedAttributes : undefined;
  }

  // Get all products
  async getAllProducts(req, res) {
    try {
      const filters = {
        categoryId: req.query.categoryId,
        brandId: req.query.brandId,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        status: req.query.status,
        isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
        search: req.query.search,
        variantSku: req.query.variantSku ? String(req.query.variantSku).trim() : undefined,
        variantMinPrice: req.query.variantMinPrice !== undefined ? parseFloat(req.query.variantMinPrice) : undefined,
        variantMaxPrice: req.query.variantMaxPrice !== undefined ? parseFloat(req.query.variantMaxPrice) : undefined,
        variantAttributes: this._buildVariantAttributesFilter(
          req.query.variantAttributes,
          req.query.color,
          req.query.storage,
          req.query.ram,
          req.query
        ),
        specifications: this._parseSpecificationsFilter(req.query.specifications),
        page: req.query.page ? parseInt(req.query.page, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined
      };
      const sorting = this._parseSorting(req.query.sortBy, req.query.sortOrder);
      Object.assign(filters, sorting);

      const result = await productService.getAllProducts(filters);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      const statusCode = (
        error.message.startsWith('Invalid specifications filter') ||
        error.message.startsWith('Invalid variantAttributes filter') ||
        error.message.startsWith('Invalid sortBy') ||
        error.message.startsWith('Invalid sortOrder')
      ) ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create product
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProductController();
