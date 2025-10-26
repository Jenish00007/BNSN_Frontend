# Redux Product Management

This directory contains the Redux setup for managing products in the Seller App.

## Structure

```
src/redux/
├── store.js              # Redux store configuration
├── hooks.js              # Custom Redux hooks
├── slices/
│   └── productSlice.js   # Product management slice
└── README.md             # This file
```

## Setup

The Redux store is configured in `App.js` with the Redux Provider wrapping the entire app:

```javascript
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

// In App.js
<Provider store={store}>
  {/* Your app components */}
</Provider>
```

## Available Actions

### 1. getAllProductsShop(shopId)
Fetches all products for a specific shop.

```javascript
import { useAppDispatch } from '../redux/hooks';
import { getAllProductsShop } from '../redux/slices/productSlice';

const dispatch = useAppDispatch();
dispatch(getAllProductsShop(shopId));
```

### 2. createProduct(productData)
Creates a new product. `productData` should be a FormData object.

```javascript
import { createProduct } from '../redux/slices/productSlice';

const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', '100');
formData.append('file', imageFile);

dispatch(createProduct(formData));
```

### 3. updateProduct({ productId, productData })
Updates an existing product.

```javascript
import { updateProduct } from '../redux/slices/productSlice';

const productData = {
  name: 'Updated Product Name',
  price: '150'
};

dispatch(updateProduct({ productId: 'product_id', productData }));
```

### 4. deleteProduct(productId)
Deletes a product.

```javascript
import { deleteProduct } from '../redux/slices/productSlice';

dispatch(deleteProduct('product_id'));
```

## State Structure

The product slice maintains the following state:

```javascript
{
  products: [],        // Array of products
  loading: false,      // Loading state
  error: null,         // Error message
  success: false,      // Success state
  message: '',         // Success/error message
  uploadingFile: false // File upload state
}
```

## Usage in Components

### Basic Usage

```javascript
import React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getAllProductsShop, clearError, clearSuccess } from '../redux/slices/productSlice';

const ProductList = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error, success, message } = useAppSelector(
    (state) => state.product
  );

  useEffect(() => {
    // Fetch products when component mounts
    dispatch(getAllProductsShop(shopId));
  }, [dispatch]);

  useEffect(() => {
    // Handle success messages
    if (success && message) {
      Alert.alert('Success', message);
      dispatch(clearSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    // Handle error messages
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        products.map(product => (
          <Text key={product._id}>{product.name}</Text>
        ))
      )}
    </View>
  );
};
```

### Creating a Product

```javascript
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createProduct } from '../redux/slices/productSlice';

const CreateProduct = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.product);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });

  const handleSubmit = () => {
    const productFormData = new FormData();
    productFormData.append('name', formData.name);
    productFormData.append('price', formData.price);
    productFormData.append('description', formData.description);
    
    dispatch(createProduct(productFormData));
  };

  return (
    <View>
      <TextInput
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        placeholder="Product Name"
      />
      <TouchableOpacity onPress={handleSubmit} disabled={loading}>
        <Text>{loading ? 'Creating...' : 'Create Product'}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Error Handling

The Redux slice automatically handles API errors and provides them through the `error` state. Always clear errors after displaying them:

```javascript
useEffect(() => {
  if (error) {
    Alert.alert('Error', error);
    dispatch(clearError());
  }
}, [error, dispatch]);
```

## Success Handling

Similarly, success messages are handled through the `success` and `message` states:

```javascript
useEffect(() => {
  if (success && message) {
    Alert.alert('Success', message);
    dispatch(clearSuccess());
  }
}, [success, message, dispatch]);
```

## API Endpoints

The Redux actions use the following API endpoints:

- `GET /product/get-all-products-shop/:shopId` - Get all products for a shop
- `POST /product/create-product` - Create a new product
- `PUT /product/update-product/:id` - Update a product
- `DELETE /product/delete-shop-product/:id` - Delete a product

All endpoints require authentication via Bearer token in the Authorization header.

## Authentication

The Redux actions automatically include the authentication token from AsyncStorage. Make sure the user is logged in before using these actions.

## Example Components

See the following example components for complete implementations:

- `src/components/ProductManagement/ProductList.js` - Product listing with Redux
- `src/components/ProductManagement/CreateProduct.js` - Product creation with Redux

These components demonstrate the complete Redux integration with proper error handling, loading states, and user feedback. 