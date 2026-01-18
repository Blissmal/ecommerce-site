"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import {
  updateItemOptimistic,
  removeItemOptimistic,
  revertOptimisticUpdate,
  updateCartItemAsync,
  removeCartItemAsync,
} from "@/redux/features/cart-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { selectCartItems } from "@/redux/features/cart-slice";
import { toast } from "react-hot-toast";

const SingleItem = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState(item.quantity);
  const prevCart = useAppSelector(selectCartItems);

  // Use discountedPrice (the actual price after discount) instead of original price
  const priceToUse = item.discountedPrice || item.product.price;
  const hasDiscount = item.product.discount && item.product.discount > 0;

  const handleRemoveFromCart = () => {
    dispatch(removeItemOptimistic(item.id));

    dispatch(removeCartItemAsync(item.product.id))
      .then(() => {
        toast.success("Item removed from cart");
      })
      .catch(() => {
        dispatch(revertOptimisticUpdate(prevCart));
        toast.error("Failed to remove item");
      });
  };

  const handleUpdateQuantity = (newQty: number) => {
    setQuantity(newQty);
    dispatch(updateItemOptimistic({ id: item.id, quantity: newQty }));

    dispatch(updateCartItemAsync({ id: item.id, quantity: newQty }))
      .then(() => {
        toast.success("Cart updated");
      })
      .catch(() => {
        dispatch(revertOptimisticUpdate(prevCart));
        setQuantity(item.quantity); // Roll back UI
        toast.error("Failed to update quantity");
      });
  };

  const handleIncreaseQuantity = () => {
    const newQty = quantity + 1;
    handleUpdateQuantity(newQty);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      handleUpdateQuantity(newQty);
    }
  };

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-7.5">
      <div className="min-w-[400px]">
        <div className="flex items-center justify-between gap-5">
          <div className="w-full flex items-center gap-5.5">
            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5">
              <Image width={200} height={200} src={item.product.imageUrl} alt="product" />
            </div>
            <div>
              <h3 className="text-dark ease-out duration-200 hover:text-blue">
                <a href="#"> {item.product.title} </a>
              </h3>
              {/* Show discount badge if applicable */}
              {hasDiscount && (
                <span className="text-xs text-green">
                  {item.product.discount}% off applied
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unit Price - Use DISCOUNTED price */}
      <div className="min-w-[180px]">
        {hasDiscount ? (
          <div className="flex flex-col">
            <p className="text-dark font-medium">${priceToUse.toFixed(2)}</p>
            <p className="text-sm text-gray-500 line-through">
              ${item.product.price.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="text-dark">${priceToUse.toFixed(2)}</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="min-w-[275px]">
        <div className="w-max flex items-center rounded-md border border-gray-3">
          <button
            onClick={handleDecreaseQuantity}
            aria-label="button for remove product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue"
          >
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" />
            </svg>
          </button>

          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4">
            {quantity}
          </span>

          <button
            onClick={handleIncreaseQuantity}
            aria-label="button for add product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue"
          >
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" />
              <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Total Price - Use DISCOUNTED price */}
      <div className="min-w-[200px]">
        <p className="text-dark font-medium">${(priceToUse * quantity).toFixed(2)}</p>
        {hasDiscount && (
          <p className="text-xs text-gray-500">
            (${((priceToUse * quantity) - (item.product.price * quantity)).toFixed(2)} saved)
          </p>
        )}
      </div>

      {/* Remove Button */}
      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={handleRemoveFromCart}
          aria-label="remove product"
          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default SingleItem;