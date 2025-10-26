import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Async thunk for getting all orders of a shop
export const getAllOrdersOfShop = createAsyncThunk(
  'order/getAllOrdersOfShop',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get the current user's shop ID from the state
      const { dataProfile } = getState().user || {};
      const shopId = dataProfile?._id || dataProfile?.shopId;
      
      if (!shopId) {
        console.log('Shop ID not found, user profile might not be loaded yet');
        return rejectWithValue('Shop ID not found. Please try again.');
      }

      const { data } = await axios.get(
        `${API_URL}/order/get-seller-all-orders/${shopId}`
      );
      return data.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Async thunk for updating order status
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status, token }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/order/update-order-status/${orderId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { orderId, status, updatedOrder: data.order };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

const initialState = {
  orders: [],
  recentOrders: [],
  loading: false,
  error: null,
  updatingOrder: false,
  updateError: null
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.recentOrders = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.updateError = null;
    },
    setRecentOrders: (state, action) => {
      state.recentOrders = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // getAllOrdersOfShop
      .addCase(getAllOrdersOfShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrdersOfShop.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        // Set recent orders (last 5)
        state.recentOrders = action.payload.slice(0, 5);
      })
      .addCase(getAllOrdersOfShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateOrderStatus
      .addCase(updateOrderStatus.pending, (state) => {
        state.updatingOrder = true;
        state.updateError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updatingOrder = false;
        const { orderId, status, updatedOrder } = action.payload;
        
        // Update order in orders array
        const orderIndex = state.orders.findIndex(order => order._id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = { ...state.orders[orderIndex], status };
        }
        
        // Update order in recent orders array
        const recentOrderIndex = state.recentOrders.findIndex(order => order._id === orderId);
        if (recentOrderIndex !== -1) {
          state.recentOrders[recentOrderIndex] = { ...state.recentOrders[recentOrderIndex], status };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updatingOrder = false;
        state.updateError = action.payload;
      });
  }
});

export const { clearOrders, clearError, setRecentOrders } = orderSlice.actions;
export default orderSlice.reducer; 