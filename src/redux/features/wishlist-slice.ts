// redux/features/wishlist-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  product: {
    id: string;
    title: string;
    price: number;
    discount: number | null;
    imageUrl: string;
    stock: number;
    brand?: string | null;
    model?: string | null;
  };
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch wishlist items
export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/wishlist");
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Add to wishlist
export const addToWishlistAsync = createAsyncThunk(
  "wishlist/addItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) throw new Error("Failed to add to wishlist");
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove from wishlist
export const removeFromWishlistAsync = createAsyncThunk(
  "wishlist/removeItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove from wishlist");
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishlistItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Remove
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.product.id !== action.payload
        );
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;