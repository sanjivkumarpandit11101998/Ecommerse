/**
 * Product Variant Repository
 * Data access for product_variant records.
 */

const db = require('../../../config/database');

class ProductVariantRepository {
  _executor(client) {
    return client || db;
  }

  async findById(id, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT product_id, id, sku, attribute_name, attribute_value, price, created_at
       FROM product_variant
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ? this._toVariant(result.rows[0]) : null;
  }

  async findByProductId(productId, client = null) {
    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT product_id, id, sku, attribute_name, attribute_value, price, created_at
       FROM product_variant
       WHERE product_id = $1
       ORDER BY created_at ASC`,
      [productId]
    );

    return result.rows.map((row) => this._toVariant(row));
  }

  async findByProductIds(productIds, client = null) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return new Map();
    }

    const executor = this._executor(client);
    const result = await executor.query(
      `SELECT product_id, id, sku, attribute_name, attribute_value, price, created_at
       FROM product_variant
       WHERE product_id = ANY($1::uuid[])
       ORDER BY product_id ASC, created_at ASC`,
      [productIds]
    );

    const byProductId = new Map();
    for (const row of result.rows) {
      if (!byProductId.has(row.product_id)) {
        byProductId.set(row.product_id, []);
      }
      byProductId.get(row.product_id).push(this._toVariant(row));
    }

    return byProductId;
  }

  async createForProduct(productId, variants = [], client = null) {
    if (!Array.isArray(variants) || variants.length === 0) {
      return;
    }

    const executor = this._executor(client);
    for (const variant of variants) {
      const serializedAttributes = this._serializeVariantAttributes(variant);
      await executor.query(
        `INSERT INTO product_variant (product_id, sku, attribute_name, attribute_value, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          productId,
          variant.sku,
          serializedAttributes.attributeName,
          serializedAttributes.attributeValue,
          variant.price ?? null
        ]
      );
    }
  }

  async deleteByProductId(productId, client = null) {
    const executor = this._executor(client);
    await executor.query('DELETE FROM product_variant WHERE product_id = $1', [productId]);
  }

  async replaceForProduct(productId, variants = [], client = null) {
    await this.deleteByProductId(productId, client);
    await this.createForProduct(productId, variants, client);
  }

  _toVariant(row) {
    const attributeName = row.attribute_name ?? null;
    const attributeValue = row.attribute_value ?? null;
    const attributes = this._toAttributesObject(attributeName, attributeValue);
    const variant = {
      id: row.id,
      productId: row.product_id || null,
      sku: row.sku,
      attributeName,
      attributeValue,
      price: row.price !== null ? Number(row.price) : null,
      createdAt: row.created_at
    };

    if (attributes) {
      variant.attributes = attributes;
    }

    return variant;
  }

  _serializeVariantAttributes(variant) {
    if (variant && variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)) {
      const entries = Object.entries(variant.attributes)
        .map(([name, value]) => [String(name).trim(), value])
        .filter(([name]) => name.length > 0);

      if (entries.length > 0) {
        const names = entries.map(([name]) => name);
        const values = entries.map(([, value]) => (value === undefined || value === null ? null : String(value)));
        return {
          attributeName: JSON.stringify(names),
          attributeValue: JSON.stringify(values)
        };
      }
    }

    return {
      attributeName: variant.attributeName || null,
      attributeValue: variant.attributeValue || null
    };
  }

  _toAttributesObject(attributeName, attributeValue) {
    const names = this._parseJsonArray(attributeName);
    const values = this._parseJsonArray(attributeValue);

    if (names && values && names.length === values.length && names.length > 0) {
      const attributes = {};
      for (let i = 0; i < names.length; i++) {
        const key = String(names[i] ?? '').trim();
        if (!key) continue;
        attributes[key] = values[i] ?? null;
      }

      if (Object.keys(attributes).length > 0) {
        return attributes;
      }
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

module.exports = new ProductVariantRepository();
