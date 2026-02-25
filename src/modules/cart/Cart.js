/**
 * Cart Model
 * Represents a shopping cart entity in the ecommerce system
 */

class Cart {
  constructor(data = {}) {
    this.id = data.id;
    this.userId = data.userId;
    this.sessionId = data.sessionId || null;
    this.status = data.status || 'ACTIVE';
    this.currency = data.currency || 'INR';

    this.items = Array.isArray(data.items)
      ? data.items.map((item) => this._normalizeItem(item))
      : [];

    this.discountAmount = this._toAmount(data.discountAmount, 0);
    this.shippingAmount = this._toAmount(data.shippingAmount, 0);

    this.subtotalAmount = this._toAmount(data.subtotalAmount, 0);
    this.taxAmount = this._toAmount(data.taxAmount, 0);
    this.finalAmount = this._toAmount(data.finalAmount, 0);

    this.lastValidatedAt = data.lastValidatedAt || null;
    this.expiresAt = data.expiresAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    this._recalculateTotals();
  }

  // Add item to cart
  addItem(itemData) {
    const normalizedItem = this._normalizeItem(itemData);
    const existingItem = this.items.find(
      (item) => item.productVariantId === normalizedItem.productVariantId
    );

    if (existingItem) {
      existingItem.quantity += normalizedItem.quantity;
      existingItem.productName = normalizedItem.productName || existingItem.productName;
      existingItem.productId = normalizedItem.productId || existingItem.productId;
      existingItem.unitPrice = normalizedItem.unitPrice;
      existingItem.taxRate = normalizedItem.taxRate;
      this._recalculateItem(existingItem);
    } else {
      this.items.push(normalizedItem);
    }

    this._recalculateTotals();
  }

  // Remove item from cart
  removeItem(productVariantId) {
    this.items = this.items.filter((item) => item.productVariantId !== productVariantId);
    this._recalculateTotals();
  }

  // Update item quantity
  updateItemQuantity(productVariantId, quantity) {
    const safeQuantity = parseInt(quantity, 10);
    if (!Number.isInteger(safeQuantity)) {
      return;
    }

    if (safeQuantity <= 0) {
      this.removeItem(productVariantId);
      return;
    }

    const item = this.items.find((cartItem) => cartItem.productVariantId === productVariantId);
    if (item) {
      item.quantity = safeQuantity;
      this._recalculateItem(item);
      this._recalculateTotals();
    }
  }

  // Clear cart
  clear() {
    this.items = [];
    this.discountAmount = 0;
    this.shippingAmount = 0;
    this.subtotalAmount = 0;
    this.taxAmount = 0;
    this.finalAmount = 0;
    this.updatedAt = new Date();
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      sessionId: this.sessionId,
      status: this.status,
      currency: this.currency,
      items: this.items,
      subtotalAmount: this.subtotalAmount,
      discountAmount: this.discountAmount,
      taxAmount: this.taxAmount,
      shippingAmount: this.shippingAmount,
      finalAmount: this.finalAmount,
      total: this.finalAmount,
      lastValidatedAt: this.lastValidatedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  _normalizeItem(item = {}) {
    const unitPrice = this._toAmount(item.unitPrice ?? item.price, 0);
    const normalizedItem = {
      productVariantId: item.productVariantId || null,
      productId: item.productId || null,
      productName: item.productName || '',
      unitPrice,
      price: unitPrice,
      quantity: this._toInteger(item.quantity, 1),
      taxRate: this._toAmount(item.taxRate, 0),
      taxAmount: this._toAmount(item.taxAmount, 0),
      lineTotal: this._toAmount(item.lineTotal, 0)
    };

    this._recalculateItem(normalizedItem);
    return normalizedItem;
  }

  _recalculateItem(item) {
    item.price = item.unitPrice;
    item.lineTotal = this._round(item.unitPrice * item.quantity);
    item.taxAmount = this._round((item.lineTotal * item.taxRate) / 100);
  }

  _recalculateTotals() {
    this.subtotalAmount = this._round(
      this.items.reduce((total, item) => total + item.lineTotal, 0)
    );
    this.taxAmount = this._round(
      this.items.reduce((total, item) => total + item.taxAmount, 0)
    );
    this.finalAmount = this._round(
      this.subtotalAmount - this.discountAmount + this.taxAmount + this.shippingAmount
    );
    this.updatedAt = new Date();
  }

  _toAmount(value, fallback = 0) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return fallback;
    return this._round(numeric);
  }

  _toInteger(value, fallback = 0) {
    const parsed = parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : fallback;
  }

  _round(value) {
    return Number(Number(value || 0).toFixed(2));
  }
}

module.exports = Cart;
