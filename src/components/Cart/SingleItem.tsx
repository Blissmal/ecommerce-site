// components/Cart/SingleItem.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  updateQuantityOptimistic,
  updateCartItemAsync,
  removeItemOptimistic,
  removeCartItemAsync,
} from "@/redux/features/cart-slice";
import { toast } from "react-hot-toast";

interface CartItemProps {
  item: {
    id: string;
    title: string;
    price: number;
    discountedPrice: number;
    quantity: number;
    image: string;
    stock: number;
    activeDiscount?: number;
    // Variant details
    variantId?: string | null;
    color?: string | null;
    size?: string | null;
    storage?: string | null;
    sku?: string | null;
    product?: {
      id: string;
      discount: number | null;
      discountExpiry?: string | null;
      imageUrl: string;
      title: string;
      category?: string;
      slug?: string;
    };
  };
}

const SingleItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isUpdating, setIsUpdating] = useState(false);

  const originalDiscount = item.product?.discount || 0;
  const isExpired = originalDiscount > 0 && item.activeDiscount === 0;
  const hasActiveDiscount = (item.activeDiscount || 0) > 0;
  const hasDiscount = item.product?.discount && item.product.discount > 0;
  const savings = hasDiscount
    ? (item.price - item.discountedPrice) * item.quantity
    : 0;

  // Fallback slug logic
  const productUrl = `/shop-details/${item.product?.slug || item.product?.id || "#"}`;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;
    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }

    setIsUpdating(true);
    
    // Optimistic update
    dispatch(
      updateQuantityOptimistic({ cartItemId: item.id, quantity: newQuantity })
    );

    try {
      await dispatch(
        updateCartItemAsync({ cartItemId: item.id, quantity: newQuantity })
      ).unwrap();
      setIsUpdating(false);
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    // Optimistic update
    dispatch(removeItemOptimistic(item.id));

    try {
      await dispatch(removeCartItemAsync(item.id)).unwrap();
      setIsUpdating(false);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
      setIsUpdating(false);
    }
  };

  // Build variant description
  const variantDescription = [item.color, item.size, item.storage]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className={`flex items-center border-t border-gray-3 py-5 px-7.5 transition-opacity duration-200 ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}>
      
      {/* --- Section 1: Product Info (Fixed Width) --- */}
      <div className="min-w-[400px]">
        <div className="flex items-center gap-5.5">
          {/* Product Image */}
          <Link
            href={productUrl}
            className="group relative flex h-17.5 w-full max-w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-gray-3 bg-gray-2"
          >
            <Image
              width={80}
              height={70}
              src={item.image || item.product?.imageUrl || "/images/placeholder.png"}
              alt={item.title}
              className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/images/products/product-1-bg-1.png";
              }}
            />
            {hasActiveDiscount ? (
              <div className="absolute -right-1 -top-1 rounded bg-blue px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                -{item.activeDiscount}%
              </div>
            ) : isExpired ? (
              <div className="absolute -right-1 -top-1 rounded bg-gray-5 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">
                Ended
              </div>
            ) : null}
          </Link>

          {/* Product Details */}
          <div className="flex flex-col">
            <Link
              href={productUrl}
              className="mb-1 font-medium text-dark duration-200 ease-out hover:text-blue line-clamp-1"
            >
              {item.title}
            </Link>

            {/* Variant Details */}
            {variantDescription && (
              <p className="mb-1 text-sm text-body">{variantDescription}</p>
            )}

            {/* Category */}
            {item.product?.category && (
              <p className="text-xs text-body">
                Category:{" "}
                <span className="text-dark hover:text-blue transition-colors cursor-pointer">
                  {item.product.category}
                </span>
              </p>
            )}

            {/* Stock Status */}
            <div className="mt-1">
              {item.stock > 0 ? (
                <span
                  className={`text-xs font-medium ${
                    item.stock <= 5 ? "text-orange" : "text-green"
                  }`}
                >
                  {item.stock <= 5
                    ? `Only ${item.stock} left!`
                    : "In Stock"}
                </span>
              ) : (
                <span className="text-xs font-medium text-red">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: Unit Price (Fixed Width) --- */}
      <div className="min-w-[180px]">
        {hasActiveDiscount ? (
          <div className="flex flex-col">
            <p className="font-medium text-dark">
              ${item.discountedPrice.toFixed(2)}
            </p>
            <p className="text-sm text-body line-through decoration-red/40">
              ${item.price.toFixed(2)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="font-medium text-dark">${item.price.toFixed(2)}</p>
            {isExpired && (
              <p className="text-[10px] italic text-gray-5">
                Reverted to original
              </p>
            )}
          </div>
        )}
      </div>

      {/* --- Section 3: Quantity Controls (Fixed Width) --- */}
      <div className="min-w-[275px]">
        <div className="flex w-max items-center rounded-md border border-gray-3 bg-white shadow-sm">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            aria-label="Decrease quantity"
            className="flex h-11.5 w-11.5 items-center justify-center text-body duration-200 ease-out hover:bg-gray-2 hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 8H13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <span className="flex h-11.5 w-16 items-center justify-center border-x border-gray-3 font-medium text-dark select-none">
            {item.quantity}
          </span>

          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.stock || isUpdating}
            aria-label="Increase quantity"
            className="flex h-11.5 w-11.5 items-center justify-center text-body duration-200 ease-out hover:bg-gray-2 hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2.5V13.5M2.5 8H13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Section 4: Total Price (Fixed Width) --- */}
      <div className="min-w-[200px]">
        <p className="text-custom-lg font-bold text-dark">
          ${(item.discountedPrice * item.quantity).toFixed(2)}
        </p>
        {hasDiscount && (
          <p className="mt-1 text-xs font-medium text-green">
            Save ${savings.toFixed(2)}
          </p>
        )}
        <p className="mt-1 text-xs text-body">
          ${item.discountedPrice.toFixed(2)} / each
        </p>
      </div>

      {/* --- Section 5: Remove Button (Fixed Width) --- */}
      <div className="flex min-w-[50px] justify-end">
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          aria-label="Remove product"
          className="flex h-9.5 w-full max-w-[38px] items-center justify-center rounded-lg border border-gray-3 bg-white text-body duration-200 ease-out hover:border-red-light-4 hover:bg-red-light-6 hover:text-red disabled:opacity-50 transition-colors"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.5 1.5C7.10218 1.5 6.72064 1.65804 6.43934 1.93934C6.15804 2.22064 6 2.60218 6 3V3.75H3.75C3.33579 3.75 3 4.08579 3 4.5C3 4.91421 3.33579 5.25 3.75 5.25H4.5V13.5C4.5 14.2956 4.81607 15.0587 5.37868 15.6213C5.94129 16.1839 6.70435 16.5 7.5 16.5H10.5C11.2956 16.5 12.0587 16.1839 12.6213 15.6213C13.1839 15.0587 13.5 14.2956 13.5 13.5V5.25H14.25C14.6642 5.25 15 4.91421 15 4.5C15 4.08579 14.6642 3.75 14.25 3.75H12V3C12 2.60218 11.842 2.22064 11.5607 1.93934C11.2794 1.65804 10.8978 1.5 10.5 1.5H7.5ZM7.5 6.75C7.91421 6.75 8.25 7.08579 8.25 7.5V12C8.25 12.4142 7.91421 12.75 7.5 12.75C7.08579 12.75 6.75 12.4142 6.75 12V7.5C6.75 7.08579 7.08579 6.75 7.5 6.75ZM10.5 6.75C10.9142 6.75 11.25 7.08579 11.25 7.5V12C11.25 12.4142 10.9142 12.75 10.5 12.75C10.0858 12.75 9.75 12.4142 9.75 12V7.5C9.75 7.08579 10.0858 6.75 10.5 6.75Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SingleItem;