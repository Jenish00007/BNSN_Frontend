/**
 * Stock management utilities
 * Centralized logic for checking product stock status
 */

/**
 * Safely parse JSON response with proper error handling
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} - Parsed JSON data or null if parsing fails
 */
export const safeJsonParse = async (response) => {
  if (!response) return null;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      console.log('Non-JSON response received:', contentType);
      return null;
    }
  } catch (jsonError) {
    console.log('Error parsing JSON response:', jsonError);
    return null;
  }
};

/**
 * Get the actual stock quantity for a product
 * @param {Object} product - Product object
 * @returns {number} - Stock quantity (0 if out of stock)
 */
export const getProductStock = (product) => {
  if (!product) return 0;

  // Check if isInStock is explicitly set (highest priority)
  if (product.isInStock !== undefined && product.isInStock !== null) {
    return product.isInStock === true ? 1 : 0;
  }

  // Priority order for stock fields
  const stockFields = ['stock', 'availableQuantity', 'inventory'];

  for (const field of stockFields) {
    const value = product[field];
    if (value !== undefined && value !== null && !isNaN(value)) {
      return parseInt(value);
    }
  }

  return 0;
};

/**
 * Check if a product is in stock
 * @param {Object} product - Product object
 * @returns {boolean} - True if in stock, false otherwise
 */
export const isProductInStock = (product) => {
  const stock = getProductStock(product);
  return stock > 0;
};

/**
 * Get stock status with debugging information
 * @param {Object} product - Product object
 * @returns {Object} - Stock status information
 */
export const getStockStatus = (product) => {
  if (!product) {
    return {
      isInStock: false,
      stock: 0,
      debug: { error: 'Product is null or undefined' }
    };
  }

  const stock = getProductStock(product);
  const isInStock = stock > 0;
  
  const debug = {
    productId: product._id,
    productName: product.name || product.title,
    stockFields: {
      isInStock: product.isInStock,
      stock: product.stock,
      availableQuantity: product.availableQuantity,
      inventory: product.inventory,
      quantity: product.quantity // This is likely unit quantity, not stock
    },
    finalStock: stock,
    isInStock
  };

  // Log debug information in development
  if (__DEV__) {
    console.log(`Stock check for ${product.name || product.title}:`, debug);
  }

  return {
    isInStock,
    stock,
    debug
  };
};

/**
 * Validate stock data and log warnings for inconsistent data
 * @param {Object} product - Product object
 */
export const validateStockData = (product) => {
  if (!product) return;

  const { stock, availableQuantity, inventory, quantity } = product;
  
  // Check for potential data inconsistencies
  const stockValues = [stock, availableQuantity, inventory].filter(val => 
    val !== undefined && val !== null && !isNaN(val)
  );
  
  if (stockValues.length > 1) {
    const uniqueValues = [...new Set(stockValues)];
    if (uniqueValues.length > 1) {
      // Only log in development mode to reduce console noise
      if (__DEV__) {
        console.warn(`Inconsistent stock values for product ${product.name || product._id}:`, {
          stock,
          availableQuantity,
          inventory,
          quantity
        });
      }
    }
  }

  // Warn if quantity field might be confused with stock
  if (quantity && typeof quantity === 'string' && quantity.includes('g')) {
    // Only log in development mode to reduce console noise
    if (__DEV__) {
      console.warn(`Product ${product.name || product._id} has quantity field that appears to be unit weight:`, quantity);
    }
  }
};
