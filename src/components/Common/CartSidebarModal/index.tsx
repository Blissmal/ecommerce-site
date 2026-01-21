"use client";
import React, { useEffect, useState } from "react";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  removeCartItemAsync,
  removeItemOptimistic,
  selectTotalPrice,
} from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import SingleItem from "./SingleItem";
import Link from "next/link";
import EmptyCart from "./EmptyCart";

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <>
      {/* 1. Backdrop Overlay - Fades and Blurs in place */}
      <div
        className={`fixed inset-0 z-[9999] bg-dark/40 transition-all duration-500 ease-in-out ${
          isCartModalOpen 
            ? "opacity-100 backdrop-blur-sm pointer-events-auto" 
            : "opacity-0 backdrop-blur-0 pointer-events-none"
        }`}
        onClick={closeCartModal} // Clicking the background closes the modal
      />

      {/* 2. Sidebar Drawer - Slides independently */}
      <div
        className={`fixed top-0 right-0 z-[10000] h-screen w-full max-w-[500px] bg-white shadow-2xl transition-transform duration-500 ease-out transform ${
          isCartModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full modal-content">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white flex items-center justify-start space-x-2 pb-7 pt-4 sm:pt-7.5 lg:pt-11 border-b border-gray-3 px-4 sm:px-7.5 lg:px-11">
            <button
              onClick={() => closeCartModal()}
              aria-label="button for close modal"
              className="flex items-center justify-center ease-in duration-150 bg-meta text-dark-5 hover:text-dark"
            >
              <svg
                className="fill-current"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5379 11.2121C12.1718 10.846 11.5782 10.846 11.212 11.2121C10.8459 11.5782 10.8459 12.1718 11.212 12.5379L13.6741 15L11.2121 17.4621C10.846 17.8282 10.846 18.4218 11.2121 18.7879C11.5782 19.154 12.1718 19.154 12.5379 18.7879L15 16.3258L17.462 18.7879C17.8281 19.154 18.4217 19.154 18.7878 18.7879C19.154 18.4218 19.154 17.8282 18.7878 17.462L16.3258 15L18.7879 12.5379C19.154 12.1718 19.154 11.5782 18.7879 11.2121C18.4218 10.846 17.8282 10.846 17.462 11.2121L15 13.6742L12.5379 11.2121Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15 1.5625C7.57867 1.5625 1.5625 7.57867 1.5625 15C1.5625 22.4213 7.57867 28.4375 15 28.4375C22.4213 28.4375 28.4375 22.4213 28.4375 15C28.4375 7.57867 22.4213 1.5625 15 1.5625ZM3.4375 15C3.4375 8.61421 8.61421 3.4375 15 3.4375C21.3858 3.4375 26.5625 8.61421 26.5625 15C26.5625 21.3858 21.3858 26.5625 15 26.5625C8.61421 26.5625 3.4375 21.3858 3.4375 15Z"
                  fill=""
                />
              </svg>
            </button>
            <h2 className="font-medium text-dark text-lg sm:text-2xl">
              Cart View
            </h2>
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-grow overflow-y-auto px-4 sm:px-7.5 lg:px-11 py-6 no-scrollbar">
            <div className="flex flex-col gap-6">
              {cartItems.length > 0 ? (
                cartItems.map((item, key) => (
                  <SingleItem
                    key={key}
                    item={item}
                    removeItemFromCart={removeItemOptimistic}
                    removeFromCartAsync={removeCartItemAsync}
                    closeCartModal={closeCartModal}
                  />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>

          {/* Footer - Sticky Bottom */}
          <div className="border-y border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 px-4 sm:px-7.5 lg:px-11 sticky bottom-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-5 mb-6">
              <p className="font-medium text-xl text-dark">Subtotal:</p>
              <p className="font-medium text-xl text-dark">${totalPrice}</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Link
                onClick={() => closeCartModal()}
                href="/cart"
                className="w-full flex justify-center font-medium text-gray-7 bg-gray-3 py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-gray-4"
              >
                View Cart
              </Link>

              <Link
                href="/checkout"
                onClick={() => closeCartModal()}
                className="w-full flex justify-center font-medium text-gray-3 bg-gray-7 py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
              >
                Continue to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebarModal;