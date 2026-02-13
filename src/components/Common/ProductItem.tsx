"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemOptimistic, addItemToCartAsync } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { toast } from "react-hot-toast";
import DiscountTimer from "./DiscountTimer";

interface ProductVariant {
  id: string;
  price: number;
  stock: number;
  isDefault: boolean;
}

interface ProductItemProps {
  item: {
    id: string;
    title: string;
    price: number;
    discount?: number | null;
    discountExpiry?: string | null;
    stock: number;
    imageUrl: string;
    images?: string;
    brand?: string | null;
    description?: string;
    model?: string | null;
    category?: {
      name: string;
      id?: string;
      slug?: string;
    };
    variants?: ProductVariant[];
    _count?: {
      variants?: number;
    };
  };
}

const ProductItem: React.FC<ProductItemProps> = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openModal } = useModalContext();

  // --- Logic & Data Preparation ---

  // 1. Resolve Variant
  const defaultVariant = item.variants?.find((v) => v.isDefault) || item.variants?.[0];
  const hasMultipleVariants = (item.variants?.length || 0) > 1;

  // 2. Resolve Price & Discount (Premium Logic)
  const basePrice = defaultVariant?.price ?? item.price;

  // Ensure discount is treated as a number and exists
  const discountValue = item.discount ? Number(item.discount) : 0;
  const hasDiscount = discountValue > 0;

  const discountedPrice = hasDiscount
    ? basePrice * (1 - discountValue / 100)
    : basePrice;

  // 3. Formatter (Premium currency display)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 4. Display Titles & Stock
  const displayTitle = item.brand && item.model
    ? `${item.brand} ${item.model}`
    : item.title;

  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;

  // --- Handlers ---

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation if wrapped

    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    if (!defaultVariant) {
      toast.error("No variants available");
      return;
    }

    // Optimistic Update
    dispatch(
      addItemOptimistic({
        title: item.title,
        price: defaultVariant.price,
        discountedPrice: discountedPrice,
        quantity: 1,
        image: item.imageUrl,
        stock: defaultVariant.stock,
        variantId: defaultVariant.id,
        product: {
          id: item.id,
          discount: item.discount,
          imageUrl: item.imageUrl,
          title: item.title,
          category: item.category?.name,
        },
      })
    );

    try {
      await dispatch(
        addItemToCartAsync({
          productId: item.id,
          variantId: defaultVariant.id,
          quantity: 1,
        })
      ).unwrap();
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
      console.error("Add to cart error:", err);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(
      addItemToWishlist({
        id: item.id,
        title: item.title,
        price: basePrice,
        discountedPrice: discountedPrice,
        quantity: 1,
        status: "available",
        imgs: {
          previews: [item.imageUrl],
          thumbnails: [item.imageUrl],
        },
      })
    );
    toast.success("Added to wishlist!");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    const serializedItem = {
      id: item.id,
      title: displayTitle,
      price: basePrice,
      discount: item.discount,
      reviews: 0,
      imageUrl: item.imageUrl,
      images: item.images,
      description: item.description,
      stock: item.stock,
      category: item.category || { id: "", name: "", slug: "" },
      variants: item.variants || [],
    };
    dispatch(updateQuickView(serializedItem));
    openModal();
  };

  return (
    <div className="group bg-white rounded-lg">
      {/* --- Image Section --- */}
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-gray-1 min-h-[270px] mb-4">
        {item.discountExpiry && item.discount! > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <DiscountTimer endDate={item.discountExpiry} />
          </div>
        )}
        <Link href={`/shop-details/${item.id}`} className="w-full h-full flex justify-center items-center">
          <Image
            src={item.imageUrl || "/images/products/product-1-bg-1.png"}
            alt={displayTitle}
            width={250}
            height={250}
            className="object-contain transition-transform duration-300 group-hover:scale-105 w-[250px] h-[250px]"
            onError={(e) => {
              e.currentTarget.src = "/images/products/product-1-bg-1.png";
            }}
          />
        </Link>

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {hasDiscount && (
            <span className="bg-red text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
              -{Math.round(discountValue)}%
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {hasMultipleVariants && (
            <span className="bg-blue text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">
              {item.variants?.length} Options
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-dark text-white px-4 py-2 rounded-md font-semibold shadow-2">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover Action Buttons */}
        <div className="absolute left-0 bottom-4 w-full flex items-center justify-center gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-30 px-4">

          {/* Quick View */}
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            className="flex items-center justify-center w-10 h-10 rounded-md bg-white text-dark shadow-2 hover:bg-blue hover:text-white transition-colors duration-200"
          >
            <svg className="fill-current w-5 h-5" viewBox="0 0 16 16">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2131 5.52545C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z" />
            </svg>
          </button>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 inline-flex justify-center items-center h-10 px-4 rounded-md bg-blue text-white font-medium shadow-2 hover:bg-blue-dark disabled:bg-gray-4 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isOutOfStock ? "Sold Out" : "Add to Cart"}
          </button>

          {/* Wishlist */}
          <button
            onClick={handleAddToWishlist}
            aria-label="Add to wishlist"
            className="flex items-center justify-center w-10 h-10 rounded-md bg-white text-dark shadow-2 hover:bg-blue hover:text-white transition-colors duration-200"
          >
            <svg className="fill-current w-5 h-5" viewBox="0 0 16 16">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Details Section --- */}
      <div className="flex flex-col gap-1.5">
        {/* Rating Star Placeholder */}
        <div className="flex items-center gap-2">
          <div className="flex text-yellow">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M6.99999 0.833344L8.58332 5.25001H13.1667L9.29166 8.16668L10.875 12.5833L6.99999 9.66668L3.12499 12.5833L4.70832 8.16668L0.833324 5.25001H5.41666L6.99999 0.833344Z" />
              </svg>
            ))}
          </div>
          <span className="text-body text-xs font-medium">(0)</span>
        </div>

        {/* Title */}
        <h3 className="font-medium text-dark text-lg leading-tight hover:text-blue transition-colors">
          <Link href={`/shop-details/${item.id}`} className="line-clamp-2">
            {item.title}
          </Link>
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mt-1">
          {hasDiscount ? (
            <>
              <span className="font-bold text-lg text-blue">
                {formatCurrency(discountedPrice)}
              </span>
              <span className="text-sm text-body line-through decoration-slate-400">
                {formatCurrency(basePrice)}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg text-dark">
              {formatCurrency(basePrice)}
            </span>
          )}
        </div>

        {/* Low Stock Warning */}
        {isLowStock && !isOutOfStock && (
          <p className="text-xs font-medium text-orange mt-0.5 animate-pulse">
            Only {item.stock} left in stock!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductItem;