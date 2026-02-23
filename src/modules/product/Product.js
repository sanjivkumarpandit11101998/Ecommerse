/**
 * Product Model
 * Represents a product entity in the ecommerce system
 */

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.shortDescription = data.shortDescription || '';
    this.description = data.description || '';
    this.basePrice = Number(data.basePrice || 0);
    this.brandId = data.brandId || null;
    this.brandName = data.brandName || null;
    this.categoryId = data.categoryId || null;
    this.categoryName = data.categoryName || null;
    this.status = data.status || 'ACTIVE';
    this.isFeatured = Boolean(data.isFeatured);
    this.averageRating = Number(data.averageRating || 0);
    this.images = Array.isArray(data.images) ? data.images : [];
    this.variants = Array.isArray(data.variants) ? data.variants : [];
    this.specifications = data.specifications || null;
    this.reviews = Array.isArray(data.reviews) ? data.reviews : [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validate product data
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!data.slug || data.slug.trim().length === 0) {
      errors.push('Product slug is required');
    }

    if (data.basePrice === undefined || data.basePrice === null || Number(data.basePrice) <= 0) {
      errors.push('Product basePrice must be greater than 0');
    }

    if (data.status && !['ACTIVE', 'INACTIVE', 'DRAFT'].includes(data.status)) {
      errors.push('Status must be ACTIVE, INACTIVE or DRAFT');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      shortDescription: this.shortDescription,
      description: this.description,
      basePrice: this.basePrice,
      brandId: this.brandId,
      brandName: this.brandName,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      status: this.status,
      isFeatured: this.isFeatured,
      averageRating: this.averageRating,
      images: this.images,
      variants: this.variants,
      specifications: this.specifications,
      reviews: this.reviews,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;
