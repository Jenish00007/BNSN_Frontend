import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunks
export const getAllProductsShop = createAsyncThunk(
  'product/getAllProductsShop',
  async (shopId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/product/get-all-products-shop/${shopId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('data', data);
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch products');
      }

      return data.products;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/product/delete-shop-product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete product');
      }

      return { message: data.message, productId };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/product/create-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: productData, // FormData object
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create product');
      }

      return data.product;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/product/update-product/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update product');
      }

      return data.product;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Initial state
const initialState = {
  products: [],
  loading: false,
  error: null,
  success: false,
  message: '',
  uploadingFile: false,
};

// Slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    setUploadingFile: (state, action) => {
      state.uploadingFile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // getAllProductsShop
    builder
      .addCase(getAllProductsShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProductsShop.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(getAllProductsShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // deleteProduct
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product._id !== action.payload.productId
        );
        state.success = true;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createProduct
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.success = true;
        state.message = 'Product created successfully';
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // updateProduct
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.success = true;
        state.message = 'Product updated successfully';
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setUploadingFile } = productSlice.actions;
export default productSlice.reducer; 