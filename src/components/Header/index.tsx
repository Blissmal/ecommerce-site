// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
// import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
// import Image from "next/image";
// import type { AppDispatch, RootState } from "@/redux/store";

// const Header = () => {
//   const [stickyMenu, setStickyMenu] = useState(false);
//   const [user, setUser] = useState<null | { id: string; email: string }>(null);
//   const { openCartModal } = useCartModalContext();
//   const dispatch = useDispatch<AppDispatch>();

//   const productCount = useSelector((state: RootState) => state.cartReducer.items.length);
//   const totalPrice = useSelector(selectTotalPrice);

//   useEffect(() => {
//     const handleStickyMenu = () => setStickyMenu(window.scrollY >= 40);
//     window.addEventListener("scroll", handleStickyMenu);
//     return () => window.removeEventListener("scroll", handleStickyMenu);
//   }, []);

//   useEffect(() => {
//     const initData = async () => {
//       try {
//         const res = await fetch("/api/login-check");
//         const data = await res.json();
//         setUser(data.user);
//       } catch (err) {
//         console.error("Auth check failed", err);
//       }
//     };
//     initData();
//     dispatch(fetchCartItems());
//   }, [dispatch]);

//   return (
//     <header
//       className={`fixed left-0 top-0 w-full z-999 transition-all duration-300 bg-white ${
//         stickyMenu ? "shadow-1 py-4.5" : "py-7.5"
//       }`}
//     >
//       <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
//         <div className="flex items-center justify-between">

//           {/* 1. Logo Section */}
//           <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105">
//             <Image
//               src="/hero.webp"
//               alt="Logo"
//               width={50}
//               height={50}
//               className="w-10 h-10 lg:w-12.5 lg:h-12.5"
//             />
//           </Link>

//           {/* 2. Desktop Navigation - Using your custom-sm size and gray-6 color */}
//           <nav className="hidden lg:flex items-center gap-9.5 text-custom-sm font-semibold uppercase tracking-wider text-gray-6">
//             <Link href="#" className="hover:text-blue transition-colors">Shop</Link>
//             <Link href="#categories" className="hover:text-blue transition-colors">Categories</Link>
//             <Link href="#newArrivals" className="hover:text-blue transition-colors">New Arrivals</Link>
//           </nav>

//           {/* 3. Action Group */}
//           <div className="flex items-center gap-5 sm:gap-7.5">

//             {/* Search Trigger */}
//             {/* <button className="text-dark hover:text-blue transition-colors" aria-label="Search">
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5.5 h-5.5">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
//               </svg>
//             </button> */}

//             {/* Account - Using your blue and dark-5 colors */}
//             {user ? (
//               <Link href="/my-account" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-2 border border-gray-3 hover:border-blue transition-all">
//                 <span className="text-custom-xs font-bold text-dark">{user.email[0].toUpperCase()}</span>
//               </Link>
//             ) : (
//               <Link href="/handler/login" className="text-custom-sm font-bold text-blue hover:text-blue-dark transition-colors">
//                 Login
//               </Link>
//             )}

//             {/* Cart - Using your red for badge and dark for text */}
//             <button
//               onClick={openCartModal}
//               className="group relative flex items-center gap-3"
//               aria-label="Open cart"
//             >
//               <div className="relative">
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6.5 h-6.5 text-dark group-hover:text-blue transition-colors">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 11.211a2.25 2.25 0 0 1-2.247 2.472H4.402a2.25 2.25 0 0 1-2.247-2.472L3.268 8.507a2.25 2.25 0 0 1 2.247-2.25h13.218a2.25 2.25 0 0 1 2.247 2.25Z" />
//                 </svg>
//                 {productCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red text-white text-2xs font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-1">
//                     {productCount}
//                   </span>
//                 )}
//               </div>

//               <div className="hidden xsm:block text-left leading-none">
//                 <span className="block text-2xs font-bold text-gray-5 uppercase mb-1">My Cart</span>
//                 <span className="block font-bold text-custom-sm text-dark">
//                   ${isNaN(totalPrice) ? "0.00" : totalPrice.toFixed(2)}
//                 </span>
//               </div>
//             </button>

//             {/* Mobile Toggle */}
//             <button className="lg:hidden flex flex-col gap-1.5">
//               <span className="w-6 h-0.5 bg-dark"></span>
//               <span className="w-6 h-0.5 bg-dark"></span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

// experimentally improved with loading context

"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { store, type AppDispatch, type RootState } from "@/redux/store";
import { useLoader } from "@/app/context/LoadingContext";
import { MessageCircle } from "lucide-react";
import { fetchWishlistItems } from "@/redux/features/wishlist-slice";

const Header = () => {
  const [stickyMenu, setStickyMenu] = useState(false);
  const [user, setUser] = useState<null | { id: string; email: string }>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCartModal } = useCartModalContext();
  const { setIsLoading } = useLoader();
  const dispatch = useDispatch<AppDispatch>();

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  const productCount = useSelector((state: RootState) => state.cartReducer.items.length);
  const totalPrice = useSelector(selectTotalPrice);

  // Sticky menu effect
  useEffect(() => {
    const handleStickyMenu = () => setStickyMenu(window.scrollY >= 40);
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  // Initialization effect with proper cleanup
  useEffect(() => {
    isMountedRef.current = true;
    let loadingTimer: NodeJS.Timeout;

    const initData = async () => {
      try {
        // 1. Check Login Status first
        const authRes = await fetch("/api/login-check");
        const authData = await authRes.json();

        if (isMountedRef.current && authData.user) {
          setUser(authData.user);

          // 2. ONLY once authed, Sync the User
          // We wait for this to finish to ensure the DB record exists
          await fetch("/api/sync-user");

          // 3. ONLY once synced, fetch the Cart
          // This ensures /api/cart findUnique { authId } won't 404
          await dispatch(fetchCartItems());
          const wishlistItems = store.getState().wishlistReducer.items;

          if (wishlistItems.length === 0) {
            await dispatch(fetchWishlistItems());
          }

          // 4. Fetch other dependent data like orders
          // dispatch(fetchOrders()); 
        }
      } catch (err) {
        console.error("Initialization error", err);
      } finally {
        if (isMountedRef.current) {
          loadingTimer = setTimeout(() => {
            if (isMountedRef.current) setIsLoading(false);
          }, 300);
        }
      }
    };

    initData();

    return () => {
      isMountedRef.current = false;
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [dispatch, setIsLoading]);

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed left-0 top-0 w-full z-999 transition-all duration-300 bg-white ${stickyMenu ? "shadow-1 py-4.5" : "py-7.5"
        }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        <div className="flex items-center justify-between gap-4">

          {/* 1. Logo Section */}
          <Link
            href="/"
            className="flex-shrink-0 transition-transform hover:scale-105"
            aria-label="Home"
          >
            <Image
              src="https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=100&h=100&fit=crop&auto=format"
              alt="Store Logo"
              width={50}
              height={50}
              className="w-10 h-10 lg:w-12.5 lg:h-12.5 rounded-lg object-cover"
              priority
            />
          </Link>

          {/* 2. Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-9.5 text-custom-sm font-semibold uppercase tracking-wider text-gray-6"
            aria-label="Main navigation"
          >
            <Link
              href="/shop-with-sidebar"
              className="hover:text-blue transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/#categories"
              className="hover:text-blue transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/#newArrivals"
              className="hover:text-blue transition-colors"
            >
              New Arrivals
            </Link>
          </nav>

          {/* 3. Action Group */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-7.5">

            {/* Account */}
            {user ? (
              <Link
                href="/my-account"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-2 border border-gray-3 hover:border-blue hover:bg-blue/5 transition-all"
                aria-label={`Account for ${user.email}`}
                title="My Account"
              >
                <span className="text-custom-xs font-bold text-dark">
                  {user.email[0].toUpperCase()}
                </span>
              </Link>
            ) : (
              <Link
                href="/handler/login"
                className="text-custom-sm font-bold text-blue hover:text-blue-dark transition-colors whitespace-nowrap"
              >
                Login
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openCartModal}
              className="group relative flex items-center gap-2.5 sm:gap-3"
              aria-label={`Open cart with ${productCount} items`}
              title="View Cart"
            >
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6.5 h-6.5 text-dark group-hover:text-blue transition-colors"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 11.211a2.25 2.25 0 0 1-2.247 2.472H4.402a2.25 2.25 0 0 1-2.247-2.472L3.268 8.507a2.25 2.25 0 0 1 2.247-2.25h13.218a2.25 2.25 0 0 1 2.247 2.25Z"
                  />
                </svg>
                {productCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-red text-white text-2xs font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-1"
                    aria-label={`${productCount} items in cart`}
                  >
                    {productCount > 9 ? '9+' : productCount}
                  </span>
                )}
              </div>

              <div className="hidden xsm:block text-left leading-none">
                <span className="block text-2xs font-bold text-gray-5 uppercase mb-1">
                  My Cart
                </span>
                <span className="block font-bold text-custom-sm text-dark group-hover:text-blue transition-colors">
                  KES {totalPrice.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </button>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span
                className={`w-6 h-0.5 bg-dark transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
              />
              <span
                className={`w-6 h-0.5 bg-dark transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''
                  }`}
              />
              <span
                className={`w-6 h-0.5 bg-dark transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav
            className="lg:hidden mt-6 pb-6 border-t border-gray-3 pt-6 animate-fadeIn"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-4 text-custom-sm font-semibold uppercase tracking-wider text-gray-6">
              <Link
                href="/shop-with-sidebar"
                className="hover:text-blue transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/#categories"
                className="hover:text-blue transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/#newArrivals"
                className="hover:text-blue transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;