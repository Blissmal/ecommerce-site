// redux/features/cart-slice.ts
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// ==================== TYPES ====================

export interface CartItem {
  id: string;
  title: string;
  price: number;          // Original variant price
  discountedPrice: number; // Price after discount
  quantity: number;
  image: string;
  stock: number;
  
  // Variant details
  variantId?: string | null;
  color?: string | null;
  size?: string | null;
  storage?: string | null;
  sku?: string | null;
  
  product?: {
    id: string;
    discount: number | null;
    imageUrl: string;
    title: string;
    category?: string;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// ==================== ASYNC THUNKS ====================

/**
 * Fetch cart items from API
 */
export const fetchCartItems = createAsyncThunk(
  "cart/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      return data as CartItem[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

/**
 * Add item to cart (with variant support)
 */
export const addItemToCartAsync = createAsyncThunk(
  "cart/addItem",
  async (
    payload: { 
      productId: string; 
      variantId?: string; 
      quantity: number 
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
      }
      
      const data = await response.json();
      return data.item as CartItem;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

/**
 * Update cart item quantity
 */
export const updateCartItemAsync = createAsyncThunk(
  "cart/updateItem",
  async (
    payload: { 
      cartItemId: string; 
      quantity: number 
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update cart");
      }
      
      return payload;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

/**
 * Remove item from cart
 */
export const removeCartItemAsync = createAsyncThunk(
  "cart/removeItem",
  async (cartItemId: string, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove item");
      }
      
      return cartItemId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

/**
 * Clear entire cart
 */
export const clearCartAsync = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }
      
      return;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

// ==================== SLICE ====================

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Optimistic add to cart (immediate UI update)
     */
    addItemOptimistic: (state, action: PayloadAction<Omit<CartItem, "id">>) => {
      // Check if item already exists (matching variant)
      const existingItem = state.items.find(
        (item) => 
          item.product?.id === action.payload.product?.id && 
          item.variantId === action.payload.variantId
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          ...action.payload,
          id: `temp-${Date.now()}`, // Temporary ID
        });
      }
    },
    
    /**
     * Update quantity optimistically
     */
    updateQuantityOptimistic: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.cartItemId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    
    /**
     * Remove item optimistically
     */
    removeItemOptimistic: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    
    /**
     * Clear cart optimistically
     */
    clearCartOptimistic: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch cart items
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Add item to cart
    builder
      .addCase(addItemToCartAsync.fulfilled, (state, action) => {
        // Replace temp item with real one, or update existing
        const tempIndex = state.items.findIndex(
          (item) => 
            item.id.startsWith("temp-") && 
            item.product?.id === action.payload.product?.id &&
            item.variantId === action.payload.variantId
        );
        
        if (tempIndex !== -1) {
          state.items[tempIndex] = action.payload;
        } else {
          const existingIndex = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          
          if (existingIndex !== -1) {
            state.items[existingIndex] = action.payload;
          } else {
            state.items.push(action.payload);
          }
        }
      });
    
    // Update cart item
    builder
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload.cartItemId);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      });
    
    // Remove cart item
    builder
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
    
    // Clear cart
    builder
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      });
  },
});

// ==================== ACTIONS ====================

export const {
  addItemOptimistic,
  updateQuantityOptimistic,
  removeItemOptimistic,
  clearCartOptimistic,
} = cartSlice.actions;

// ==================== SELECTORS ====================

export const selectCartItems = (state: RootState) => state.cartReducer.items;
export const selectCartLoading = (state: RootState) => state.cartReducer.loading;
export const selectCartError = (state: RootState) => state.cartReducer.error;

// Total number of items in cart
export const selectCartCount = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
});

// Total price (using discounted prices)
export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    const price = Number(item?.discountedPrice ?? item?.price ?? 0);
    const quantity = Number(item?.quantity ?? 0);
    return total + price * quantity;
  }, 0);
});

// Total savings (difference between original and discounted)
export const selectTotalSavings = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    const originalPrice = Number(item?.price ?? 0);
    const discountedPrice = Number(item?.discountedPrice ?? item?.price ?? 0);
    const savings = originalPrice - discountedPrice;
    const quantity = Number(item?.quantity ?? 0);
    return total + savings * quantity;
  }, 0);
});

// Check if specific variant is in cart
export const selectIsVariantInCart = (productId: string, variantId?: string | null) =>
  createSelector([selectCartItems], (items) => {
    return items.some(
      (item) => 
        item.product?.id === productId && 
        item.variantId === variantId
    );
  });

// Get quantity of specific variant in cart
export const selectVariantQuantityInCart = (productId: string, variantId?: string | null) =>
  createSelector([selectCartItems], (items) => {
    const item = items.find(
      (item) => 
        item.product?.id === productId && 
        item.variantId === variantId
    );
    return item?.quantity || 0;
  });

export default cartSlice.reducer;