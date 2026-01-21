// components/Cart/OrderSummary.tsx
"use client";

import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import React from "react";

const OrderSummary = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useAppSelector(selectTotalPrice);

  return (
    <div className="lg:max-w-[455px] w-full">
      <div className="bg-white shadow-1 rounded-[10px] overflow-hidden border border-gray-3">
        {/* Header */}
        <div className="border-b border-gray-3 py-5 px-6 sm:px-8.5 bg-gray-2/50">
          <h3 className="font-bold text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-6 sm:px-8.5">
          {/* Table Header */}
          <div className="flex items-center justify-between py-4 border-b border-gray-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-body">Product</h4>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-body text-right">Subtotal</h4>
          </div>

          {/* Product Items List */}
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {cartItems.map((item, key) => (
              <div key={key} className="flex items-start justify-between py-4 border-b border-gray-2 last:border-b-0">
                <div className="pr-4">
                  <p className="text-dark font-medium line-clamp-1">{item.title}</p>
                  <p className="text-xs text-body mt-0.5">
                    Qty: <span className="text-dark">{item.quantity}</span> × ${item.discountedPrice.toFixed(2)}
                  </p>
                </div>
                <div className="shrink-0">
                  <p className="text-dark font-medium text-right">
                    {isNaN(item.discountedPrice * item.quantity)
                      ? "..."
                      : `$${(item.discountedPrice * item.quantity).toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Calculation Breakdown */}
          <div className="mt-4 space-y-3 border-t border-gray-3 pt-5">

            {/* Final Total */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-2">
              <p className="font-bold text-lg text-dark">Total</p>
              <p className="font-bold text-xl text-blue text-right">
                ${isNaN(totalPrice) ? "0.00" : totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="group relative w-full flex justify-center items-center gap-2 font-semibold text-white bg-blue py-4 px-6 rounded-lg ease-out duration-300 hover:bg-black hover:shadow-lg mt-8"
          >
            Proceed to Checkout
            <svg 
              className="transition-transform duration-300 group-hover:translate-x-1"
              width="18" 
              height="18" 
              viewBox="0 0 18 18" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M10.875 3.375L16.5 9L10.875 14.625M1.5 9H16.125" 
                stroke="currentColor" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;