/**
 * Product Repository
 * Data access for core product table records.
 */

const db = require('../../../config/database');
const Product = require('../Product');

class ProductRepository {
  _executor(client) {
    return client || db;
  }

  // Get all products with optional filters
  async findAll(filters = {}, client = null) {
    const executor = this._executor(client);
    const page = Number.isInteger(filters.page) ? filters.page : parseInt(filters.page, 10) || 1;
    const limit = Number.isInteger(filters.limit) ? filters.limit : parseInt(filters.limit, 10) || 10;
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;
    const sortColumnMap = {
      createdAt: 'p.created_at',
      updatedAt: 'p.updated_at',
      name: 'p.name',
      basePrice: 'p.base_price',
      averageRating: 'p.average_rating'
    };
    const safeSortBy = sortColumnMap[filters.sortBy] ? filters.sortBy : 'createdAt';
    const safeSortOrder = String(filters.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const selectQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.base_price,
        p.brand_id,
        b.name AS brand_name,
        p.category_id,
        c.name AS category_name,
        p.status,
        p.is_featured,
        p.average_rating,
        pi_primary.image_url AS primary_image_url,
        pi_primary.is_primary AS primary_image_is_primary,
        pi_primary.sort_order AS primary_image_sort_order,
        COALESCE(pv_agg.variants, '[]'::json) AS variants,
        p.created_at,
        p.updated_at
    `;

    const baseFromQuery = `
      FROM product p
      LEFT JOIN brand b ON b.id = p.brand_id
      LEFT JOIN category c ON c.id = p.category_id
      LEFT JOIN product_specification ps ON ps.product_id = p.id
    `;

    const listJoinQuery = `
      LEFT JOIN LATERAL (
        SELECT pi.image_url, pi.is_primary, pi.sort_order
        FROM product_image pi
        WHERE pi.product_id = p.id
        ORDER BY pi.is_primary DESC, pi.sort_order ASC
        LIMIT 1
      ) pi_primary ON TRUE
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', pv.id,
            'sku', pv.sku,
            'attributeName', pv.attribute_name,
            'attributeValue', pv.attribute_value,
            'price', pv.price,
            'createdAt', pv.created_at
          )
          ORDER BY pv.created_at ASC
        ) AS variants
        FROM product_variant pv
        WHERE pv.product_id = p.id
      ) pv_agg ON TRUE
    `;

    const whereParts = [];
    const baseParams = [];
    let paramIndex = 1;

    if (filters.categoryId) {
      whereParts.push(`p.category_id = $${paramIndex++}`);
      baseParams.push(filters.categoryId);
    }
    if (filters.brandId) {
      whereParts.push(`p.brand_id = $${paramIndex++}`);
      baseParams.push(filters.brandId);
    }
    if (filters.status) {
      whereParts.push(`p.status = $${paramIndex++}`);
      baseParams.push(filters.status);
    }
    if (filters.isFeatured !== undefined) {
      whereParts.push(`p.is_featured = $${paramIndex++}`);
      baseParams.push(filters.isFeatured);
    }
    if (filters.minPrice !== undefined) {
      whereParts.push(`p.base_price >= $${paramIndex++}`);
      baseParams.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      whereParts.push(`p.base_price <= $${paramIndex++}`);
      baseParams.push(filters.maxPrice);
    }
    if (filters.search) {
      whereParts.push(`(LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex} OR LOWER(p.short_description) LIKE $${paramIndex})`);
      baseParams.push(`%${filters.search.toLowerCase()}%`);
      paramIndex++;
    }
    const variantWhereParts = [];
    if (filters.variantSku) {
      variantWhereParts.push(`pv.sku = $${paramIndex++}`);
      baseParams.push(filters.variantSku);
    }
    if (filters.variantMinPrice !== undefined) {
      variantWhereParts.push(`COALESCE(pv.price, p.base_price) >= $${paramIndex++}`);
      baseParams.push(filters.variantMinPrice);
    }
    if (filters.variantMaxPrice !== undefined) {
      variantWhereParts.push(`COALESCE(pv.price, p.base_price) <= $${paramIndex++}`);
      baseParams.push(filters.variantMaxPrice);
    }
    if (filters.variantAttributes && typeof filters.variantAttributes === 'object' && !Array.isArray(filters.variantAttributes)) {
      const variantAttributeEntries = Object.entries(filters.variantAttributes)
        .map(([attributeName, attributeValue]) => [String(attributeName).trim(), attributeValue])
        .filter(([attributeName, attributeValue]) => (
          attributeName.length > 0 &&
          attributeValue !== undefined &&
          attributeValue !== null &&
          String(attributeValue).trim().length > 0
        ));

      for (const [attributeName, attributeValue] of variantAttributeEntries) {
        const attributeNamePlaceholder = `$${paramIndex++}`;
        const attributeValuePlaceholder = `$${paramIndex++}`;
        baseParams.push(attributeName, String(attributeValue).trim());
        variantWhereParts.push(`(
          (pv.attribute_name = ${attributeNamePlaceholder} AND pv.attribute_value = ${attributeValuePlaceholder})
          OR (
            pv.attribute_name ~ '^\\s*\\[.*\\]\\s*$'
            AND pv.attribute_value ~ '^\\s*\\[.*\\]\\s*$'
            AND EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(pv.attribute_name::jsonb) WITH ORDINALITY AS attr(name, ord)
              JOIN jsonb_array_elements_text(pv.attribute_value::jsonb) WITH ORDINALITY AS attr_value(value, ord)
                ON attr.ord = attr_value.ord
              WHERE attr.name = ${attributeNamePlaceholder}
                AND attr_value.value = ${attributeValuePlaceholder}
            )
          )
        )`);
      }
    }
    if (variantWhereParts.length > 0) {
      whereParts.push(`EXISTS (
        SELECT 1
        FROM product_variant pv
        WHERE pv.product_id = p.id
          AND ${variantWhereParts.join(' AND ')}
      )`);
    }
    if (filters.specifications && typeof filters.specifications === 'object' && !Array.isArray(filters.specifications)) {
      whereParts.push(`ps.specifications @> $${paramIndex++}::jsonb`);
      baseParams.push(JSON.stringify(filters.specifications));
    }

    const dynamicWhere = whereParts.length > 0 ? ` AND ${whereParts.join(' AND ')}` : '';
    const whereClause = `WHERE 1=1${dynamicWhere}`;
    const countQuery = `SELECT COUNT(DISTINCT p.id) AS total ${baseFromQuery} ${whereClause}`;
    const dataQuery = `${selectQuery}${baseFromQuery}${listJoinQuery} ${whereClause} ORDER BY ${sortColumnMap[safeSortBy]} ${safeSortOrder}, p.id ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

    const countResult = await executor.query(countQuery, baseParams);
    const total = Number(countResult.rows[0]?.total || 0);

    const result = await executor.query(dataQuery, [...baseParams, safeLimit, offset]);
    const items = result.rows.map((row) => this._rowToProduct(row));

    return {
      items,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit)
      }
    };
  }

  // Get product by ID
  async findById(id, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.base_price,
        p.brand_id,
        b.name AS brand_name,
        p.category_id,
        c.name AS category_name,
        p.status,
        p.is_featured,
        p.average_rating,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'imageUrl', pi.image_url,
              'isPrimary', pi.is_primary,
              'sortOrder', pi.sort_order
            )
            ORDER BY pi.sort_order ASC, pi.is_primary DESC
          )
          FROM product_image pi
          WHERE pi.product_id = p.id
        ), '[]'::json) AS images,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', pv.id,
              'sku', pv.sku,
              'attributeName', pv.attribute_name,
              'attributeValue', pv.attribute_value,
              'price', pv.price,
              'createdAt', pv.created_at
            )
            ORDER BY pv.created_at ASC
          )
          FROM product_variant pv
          WHERE pv.product_id = p.id
        ), '[]'::json) AS variants,
        (
          SELECT ps.specifications
          FROM product_specification ps
          WHERE ps.product_id = p.id
        ) AS specifications,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', r.id,
              'userId', r.user_id,
              'rating', r.rating,
              'comment', r.comment,
              'createdAt', r.created_at
            )
            ORDER BY r.created_at DESC
          )
          FROM review r
          WHERE r.product_id = p.id
        ), '[]'::json) AS reviews,
        p.created_at,
        p.updated_at
      FROM product p
      LEFT JOIN brand b ON b.id = p.brand_id
      LEFT JOIN category c ON c.id = p.category_id
      WHERE p.id = $1`,
      [id]
    );

    return result.rows[0] ? this._rowToProduct(result.rows[0]) : null;
  }

  // Create product row only
  async create(productData, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `INSERT INTO product (
        name,
        slug,
        short_description,
        description,
        base_price,
        brand_id,
        category_id,
        status,
        is_featured
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        productData.name,
        productData.slug,
        productData.shortDescription || null,
        productData.description || null,
        productData.basePrice,
        productData.brandId || null,
        productData.categoryId || null,
        productData.status || 'ACTIVE',
        Boolean(productData.isFeatured)
      ]
    );

    return this.findById(result.rows[0].id, client);
  }

  // Update product row only
  async update(id, productData, client = null) {
    const executor = this._executor(client);
    await executor.query(
      `UPDATE product
       SET
         name = $1,
         slug = $2,
         short_description = $3,
         description = $4,
         base_price = $5,
         brand_id = $6,
         category_id = $7,
         status = $8,
         is_featured = $9,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $10`,
      [
        productData.name,
        productData.slug,
        productData.shortDescription || null,
        productData.description || null,
        productData.basePrice,
        productData.brandId || null,
        productData.categoryId || null,
        productData.status || 'ACTIVE',
        Boolean(productData.isFeatured),
        id
      ]
    );

    return this.findById(id, client);
  }

  // Soft delete product by status update
  async delete(id, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `UPDATE product
       SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status <> 'DELETED'
       RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  }

  // Legacy method kept for compatibility with order/cart flows
  async updateStock() {
    throw new Error('Stock updates are not supported in current product schema');
  }

  _rowToProduct(row) {
    let images = this._toArray(row.images);
    if (images.length === 0 && row.primary_image_url) {
      images = [
        {
          imageUrl: row.primary_image_url,
          isPrimary: row.primary_image_is_primary ?? true,
          sortOrder: row.primary_image_sort_order ?? 0
        }
      ];
    }
    const variants = this._toArray(row.variants).map((variant) => this._normalizeVariant(variant));
    const reviews = this._toArray(row.reviews).map((review) => ({
      ...review,
      rating: review.rating !== null && review.rating !== undefined ? Number(review.rating) : null
    }));
    const specifications = this._toObject(row.specifications);

    return new Product({
      id: row.id,
      name: row.name,
      slug: row.slug,
      shortDescription: row.short_description,
      description: row.description,
      basePrice: Number(row.base_price),
      brandId: row.brand_id,
      brandName: row.brand_name || null,
      categoryId: row.category_id,
      categoryName: row.category_name || null,
      status: row.status,
      isFeatured: row.is_featured,
      averageRating: row.average_rating !== null ? Number(row.average_rating) : 0,
      images,
      variants,
      specifications,
      reviews,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  _toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  }

  _toObject(value) {
    if (!value) return null;
    if (typeof value === 'object' && !Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  _normalizeVariant(variant) {
    const attributeName = variant.attributeName ?? null;
    const attributeValue = variant.attributeValue ?? null;
    const attributes = this._toVariantAttributes(attributeName, attributeValue);

    const normalized = {
      ...variant,
      attributeName,
      attributeValue,
      price: variant.price !== null && variant.price !== undefined ? Number(variant.price) : null
    };

    if (attributes) {
      normalized.attributes = attributes;
    }

    return normalized;
  }

  _toVariantAttributes(attributeName, attributeValue) {
    const names = this._parseJsonArray(attributeName);
    const values = this._parseJsonArray(attributeValue);

    if (names && values && names.length === values.length && names.length > 0) {
      const attributes = {};
      for (let i = 0; i < names.length; i++) {
        const key = String(names[i] ?? '').trim();
        if (!key) continue;
        attributes[key] = values[i] ?? null;
      }

      return Object.keys(attributes).length > 0 ? attributes : null;
    }

    if (typeof attributeName === 'string' && attributeName.trim().length > 0) {
      return {
        [attributeName.trim()]: attributeValue ?? null
      };
    }

    return null;
  }

  _parseJsonArray(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null;

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new ProductRepository();
