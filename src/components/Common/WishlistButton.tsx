// components/WishlistButton.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  addToWishlistAsync,
  removeFromWishlistAsync,
  fetchWishlistItems,
} from "@/redux/features/wishlist-slice";
import { toast } from "react-hot-toast";
import { useUser } from "@stackframe/stack";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "button";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  variant = "icon",
  className = "",
  size = "md",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const wishlistItems = useSelector(
    (state: RootState) => state.wishlistReducer.items
  );

  const isInWishlist = wishlistItems.some(
    (item) => item.product.id === productId
  );

  // Fetch wishlist on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchWishlistItems());
    }
  }, [user, dispatch]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to add to wishlist");
      window.location.href = "/handler/login";
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlistAsync(productId)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlistAsync(productId)).unwrap();
        toast.success("Added to wishlist!");
      }
    } catch (error: any) {
      toast.error(error || "Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isInWishlist
            ? "bg-red text-white hover:bg-red-dark"
            : "bg-white text-dark border border-gray-3 hover:border-red hover:text-red"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Heart
          className={`${isInWishlist ? "fill-current" : ""}`}
          size={iconSizes[size]}
        />
        {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex items-center justify-center ${sizeClasses[size]} rounded-md bg-white text-dark shadow-2 hover:bg-red-light-2 hover:text-white transition-colors duration-200 disabled:opacity-50 ${className}`}
    >
      <Heart
        className={`${isInWishlist ? "fill-current text-red" : ""}`}
        size={iconSizes[size]}
      />
    </button>
  );
};

export default WishlistButton;