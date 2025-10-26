import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    product: productReducer,
    order: orderReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['product/productCreateRequest', 'product/updateProductRequest'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file'],
        // Ignore these paths in the state
        ignoredPaths: ['product.uploadingFile'],
      },
    }),
});

// Type definitions for TypeScript support (if needed)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch; 