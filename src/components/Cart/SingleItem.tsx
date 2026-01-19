// components/Cart/SingleItem.tsx
"use client";

import React from "react";
import Image from "next/image";
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
  };
}

const SingleItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }

    // Optimistic update
    dispatch(updateQuantityOptimistic({ cartItemId: item.id, quantity: newQuantity }));

    try {
      await dispatch(
        updateCartItemAsync({ cartItemId: item.id, quantity: newQuantity })
      ).unwrap();
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async () => {
    // Optimistic update
    dispatch(removeItemOptimistic(item.id));

    try {
      await dispatch(removeCartItemAsync(item.id)).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const hasDiscount = item.product?.discount && item.product.discount > 0;
  const savings = hasDiscount ? (item.price - item.discountedPrice) * item.quantity : 0;

  // Build variant description
  const variantDescription = [
    item.color,
    item.size,
    item.storage,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-7.5">
      {/* Product Info Section */}
      <div className="min-w-[400px]">
        <div className="flex items-center justify-between gap-5">
          <div className="w-full flex items-center gap-5.5">
            {/* Product Image */}
            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5 relative">
              <Image 
                width={80} 
                height={70} 
                src={item.image || item.product?.imageUrl} 
                alt={item.title}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/products/product-1-bg-1.png";
                }}
              />
              {hasDiscount && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                  -{item.product?.discount}%
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-dark font-medium ease-out duration-200 hover:text-blue mb-1">
                {item.title}
              </h3>
              
              {/* Variant Details */}
              {variantDescription && (
                <p className="text-sm text-gray-600 mb-1">{variantDescription}</p>
              )}
              
              {/* SKU */}
              {item.sku && (
                <p className="text-xs text-gray-500 mb-1">SKU: {item.sku}</p>
              )}
              
              {/* Category */}
              {item.product?.category && (
                <p className="text-xs text-gray-500">
                  <span className="text-blue">{item.product.category}</span>
                </p>
              )}
              
              {/* Stock Status */}
              {item.stock > 0 ? (
                <span className="text-xs text-green-600 font-medium">
                  {item.stock <= 5 ? `Only ${item.stock} left!` : "In Stock"}
                </span>
              ) : (
                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <span className="text-xs text-green block mt-1">
                  {item.product?.discount}% off applied
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unit Price */}
      <div className="min-w-[180px]">
        {hasDiscount ? (
          <div className="flex flex-col">
            <p className="text-dark font-medium">${item.discountedPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-500 line-through">
              ${item.price.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="text-dark font-medium">${item.discountedPrice.toFixed(2)}</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="min-w-[275px]">
        <div className="w-max flex items-center rounded-md border border-gray-3">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="button for remove product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className="fill-current" 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none"
            >
              <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" />
            </svg>
          </button>

          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4 font-medium">
            {item.quantity}
          </span>

          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            aria-label="button for add product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className="fill-current" 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none"
            >
              <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" />
              <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Total Price */}
      <div className="min-w-[200px]">
        <p className="text-dark font-medium text-lg">
          ${(item.discountedPrice * item.quantity).toFixed(2)}
        </p>
        {hasDiscount && (
          <p className="text-xs text-green-600 font-medium mt-1">
            Save ${savings.toFixed(2)}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          ${item.discountedPrice.toFixed(2)} each
        </p>
      </div>

      {/* Remove Button */}
      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={handleRemove}
          aria-label="remove product"
          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
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