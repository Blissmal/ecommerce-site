"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomSelect from "./CustomSelect";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const { openCartModal } = useCartModalContext();

  const productCount = useSelector((state: any) => state.cartReducer.items.length);
  const totalPrice = useSelector(selectTotalPrice);

  // Sticky menu effect
  useEffect(() => {
    const handleStickyMenu = () => {
      setStickyMenu(window.scrollY >= 80);
    };

    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
  const syncUser = async () => {
    try {
      await fetch("/api/sync-user");
    } catch (err) {
      console.error("User sync failed:", err);
    }
  };

  syncUser();
}, []);


  const options = [
    { label: "All Categories", value: "0" },
    { label: "Desktop", value: "1" },
    { label: "Laptop", value: "2" },
    { label: "Monitor", value: "3" },
    { label: "Phone", value: "4" },
    { label: "Watch", value: "5" },
    { label: "Mouse", value: "6" },
    { label: "Tablet", value: "7" },
  ];

  return (
    <header
      className={`fixed left-0 top-0 w-full z-50 bg-white transition-all duration-300 ${stickyMenu ? "shadow py-4" : "py-6"
        }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/hero.webp"
              alt="Logo"
              width={50}
              height={50}
            />
          </Link>

          {/* Centered search with categories */}
          <div className="flex-1 flex justify-center w-full max-w-[600px]">
            <form className="flex w-full items-center gap-2">
              {/* <CustomSelect options={options} /> */}
              <div className="relative w-full">
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  type="search"
                  placeholder="I am shopping for..."
                  className="custom-search w-full rounded-r-md border border-gray-300 bg-gray-100 py-2.5 pl-4 pr-10 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue"
                >
                  🔍
                </button>
              </div>
            </form>
          </div>

          {/* Right icons: Cart + Country */}
          <div className="flex items-center gap-5">
            <Image
              src="/kenya.svg"
              alt="Country"
              width={24}
              height={24}
              className="cursor-pointer"
            />

            {/* Cart */}
            <button
              onClick={openCartModal}
              className="relative flex items-center gap-3 focus:outline-none pr-6" // extra padding right for badge space
              aria-label="Open cart"
            >
              {/* Cart Icon */}

              {/* Cart Info */}
              <div className="text-left leading-tight">
                <span className="block text-[10px] uppercase text-gray-500">Cart</span>
                <span className="block font-semibold text-sm text-gray-900">${totalPrice}</span>
              </div>

              {/* Right-Aligned Badge */}
              {productCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {productCount}
                </span>
              )}
            </button>



            {/* Mobile menu toggle */}
            <button
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="xl:hidden block"
              aria-label="Menu"
            >
              <div className="space-y-1">
                <span className="block w-6 h-0.5 bg-black"></span>
                <span className="block w-6 h-0.5 bg-black"></span>
                <span className="block w-6 h-0.5 bg-black"></span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
