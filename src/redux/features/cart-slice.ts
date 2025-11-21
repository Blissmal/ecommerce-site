import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"

interface CartItem {
  id: string
  title: string
  price: number
  discountedPrice: number
  quantity: number
  image?: string
  stock: number
  product?: {
    discount: number
    imageUrl: string
    title: string
    description: string
    price: number
    stock: number
  }
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  lastSynced: string | null
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  lastSynced: null,
}

// Fetch cart items
export const fetchCartItems = createAsyncThunk(
  'cart/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart')
      if (!response.ok) throw new Error('Failed to fetch cart items')
      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const addItemToCartAsync = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      
      if (!response.ok) throw new Error('Failed to add item to cart')
      const data = await response.json()
      
      // Refetch cart items to ensure we have the latest data
      dispatch(fetchCartItems())
      
      return data.item
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateItem',
  async ({ id, quantity }: { id: string; quantity: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, quantity }),
      })
      
      if (!response.ok) throw new Error('Failed to update cart item')
      const data = await response.json()
      
      // Refetch cart items to ensure we have the latest data
      dispatch(fetchCartItems())
      
      return { id, quantity }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeCartItemAsync = createAsyncThunk(
  'cart/removeItem',
  async (itemId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: itemId }),
      })
      
      if (!response.ok) throw new Error('Failed to remove cart item')
      
      // Refetch cart items to ensure we have the latest data
      dispatch(fetchCartItems())
      
      return itemId
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to clear cart')
      
      // Refetch cart items to ensure we have the latest data
      dispatch(fetchCartItems())
      
      return true
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Optimistic updates
    addItemOptimistic: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          existingItem.stock
        )
      } else {
        state.items.push(action.payload)
      }
    },
    
    updateItemOptimistic: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== id)
      } else {
        const existingItem = state.items.find(item => item.id === id)
        if (existingItem) {
          existingItem.quantity = Math.min(quantity, existingItem.stock)
        }
      }
    },
    
    removeItemOptimistic: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    
    clearCartOptimistic: (state) => {
      state.items = []
    },
    
    revertOptimisticUpdate: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.items = action.payload
        state.isLoading = false
        state.error = null
        state.lastSynced = new Date().toISOString()
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      .addCase(addItemToCartAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addItemToCartAsync.fulfilled, (state, action) => {
        // Don't update state here since we're refetching
        state.isLoading = false
        state.error = null
      })
      .addCase(addItemToCartAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      .addCase(updateCartItemAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        // Don't update state here since we're refetching
        state.isLoading = false
        state.error = null
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      .addCase(removeCartItemAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        // Don't update state here since we're refetching
        state.isLoading = false
        state.error = null
      })
      .addCase(removeCartItemAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      .addCase(clearCartAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        // Don't update state here since we're refetching
        state.isLoading = false
        state.error = null
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

// Selectors
export const selectCartItems = (state: RootState) => state.cartReducer.items
export const selectCartLoading = (state: RootState) => state.cartReducer.isLoading
export const selectCartError = (state: RootState) => state.cartReducer.error

// Fixed selector - using discountedPrice from CartItem interface
export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    // Use discountedPrice as it exists directly on CartItem
    const price = Number(item?.product?.price ?? 0);
    const quantity = Number(item?.quantity ?? 0);
    return total + price * quantity;
  }, 0);
});


export const selectCartItemCount = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => total + item.quantity, 0)
})

export const {
  addItemOptimistic,
  updateItemOptimistic,
  removeItemOptimistic,
  clearCartOptimistic,
  revertOptimisticUpdate,
} = cartSlice.actions

export default cartSlice.reducer