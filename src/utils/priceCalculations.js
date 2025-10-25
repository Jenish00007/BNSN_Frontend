/**
 * Standardized price calculation utilities
 * This ensures consistent price calculations across the app
 */

/**
 * Calculate item price with proper fallbacks
 * @param {Object} item - Cart item or product item
 * @returns {Object} - Price information
 */
export const calculateItemPrice = (item) => {
  // Handle null/undefined items
  if (!item) {
    return {
      originalPrice: 0,
      discountPrice: 0,
      quantity: 0,
      itemOriginalTotal: 0,
      itemDiscountTotal: 0,
      itemDiscount: 0,
      hasDiscount: false
    };
  }

  // Handle different data structures with null safety
  const product = item.product || item;
  
  // Get prices with proper fallbacks and null safety
  const originalPrice = parseFloat(
    item.originalPrice || 
    product?.originalPrice || 
    product?.price || 
    0
  ) || 0;
  
  const discountPrice = parseFloat(
    item.discountPrice || 
    product?.discountPrice || 
    product?.price || 
    originalPrice
  ) || 0;
  
  const quantity = parseInt(item.quantity || 0) || 0;
  
  // Calculate totals
  const itemOriginalTotal = originalPrice * quantity;
  const itemDiscountTotal = discountPrice * quantity;
  const itemDiscount = itemOriginalTotal - itemDiscountTotal;
  
  return {
    originalPrice,
    discountPrice,
    quantity,
    itemOriginalTotal,
    itemDiscountTotal,
    itemDiscount,
    hasDiscount: itemDiscount > 0
  };
};

/**
 * Calculate cart summary with consistent logic
 * @param {Array} items - Array of cart items
 * @returns {Object} - Price summary
 */
export const calculateCartSummary = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalItems: 0,
      subtotal: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      total: 0,
      currency: 'INR',
      savings: 0
    };
  }

  // Filter out null/undefined items before processing
  const validItems = items.filter(item => item != null);

  const summary = validItems.reduce((acc, item) => {
    try {
      const priceInfo = calculateItemPrice(item);
      
      return {
        totalItems: acc.totalItems + priceInfo.quantity,
        subtotal: acc.subtotal + priceInfo.itemDiscountTotal,
        totalOriginalPrice: acc.totalOriginalPrice + priceInfo.itemOriginalTotal,
        totalDiscount: acc.totalDiscount + priceInfo.itemDiscount,
        total: acc.total + priceInfo.itemDiscountTotal,
        currency: 'INR',
        savings: acc.savings + priceInfo.itemDiscount
      };
    } catch (error) {
      console.warn('Error calculating price for item:', item, error);
      // Skip this item if there's an error
      return acc;
    }
  }, {
    totalItems: 0,
    subtotal: 0,
    totalOriginalPrice: 0,
    totalDiscount: 0,
    total: 0,
    currency: 'INR',
    savings: 0
  });

  // Round to 2 decimal places to avoid floating point errors
  return {
    ...summary,
    subtotal: Math.round(summary.subtotal * 100) / 100,
    totalOriginalPrice: Math.round(summary.totalOriginalPrice * 100) / 100,
    totalDiscount: Math.round(summary.totalDiscount * 100) / 100,
    total: Math.round(summary.total * 100) / 100,
    savings: Math.round(summary.savings * 100) / 100
  };
};

/**
 * Format currency with consistent logic
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  const numAmount = parseFloat(amount) || 0;
  return `${currency}${numAmount.toFixed(2)}`;
};

/**
 * Calculate tax amount
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} - Tax amount
 */
export const calculateTax = (subtotal, taxRate) => {
  const rate = parseFloat(taxRate) || 0;
  const amount = parseFloat(subtotal) || 0;
  return Math.round((amount * rate / 100) * 100) / 100;
};

/**
 * Calculate delivery charges
 * @param {number} subtotal - Subtotal amount
 * @param {number} deliveryRate - Delivery rate
 * @param {boolean} isPickup - Whether it's pickup order
 * @returns {number} - Delivery charges
 */
export const calculateDeliveryCharges = (subtotal, deliveryRate, isPickup = false) => {
  if (isPickup) return 0;
  
  const rate = parseFloat(deliveryRate) || 0;
  const amount = parseFloat(subtotal) || 0;
  return Math.round(rate * 100) / 100;
};

/**
 * Calculate final total with all charges
 * @param {Object} summary - Cart summary
 * @param {Object} charges - Additional charges
 * @returns {Object} - Final total breakdown
 */
export const calculateFinalTotal = (summary, charges = {}) => {
  const {
    taxRate = 0,
    deliveryRate = 0,
    tipAmount = 0,
    isPickup = false
  } = charges;

  const subtotal = summary.subtotal || 0;
  const tax = calculateTax(subtotal, taxRate);
  const delivery = calculateDeliveryCharges(subtotal, deliveryRate, isPickup);
  const tip = parseFloat(tipAmount) || 0;
  
  const total = subtotal + tax + delivery + tip;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    delivery: Math.round(delivery * 100) / 100,
    tip: Math.round(tip * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency: summary.currency || 'INR'
  };
};
