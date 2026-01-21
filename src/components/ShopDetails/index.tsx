// components/ShopDetails/ShopDetailsClient.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemOptimistic, addItemToCartAsync } from "@/redux/features/cart-slice";
import { toast } from "react-hot-toast";
import { updateproductDetails } from "@/redux/features/product-details";
import { useRouter } from "next/navigation";

// Type definitions
interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  color?: string | null;
  size?: string | null;
  storage?: string | null;
  images: string[];
  weight?: number | null;
  isDefault: boolean;
  createdAt?: string | Date; // Add this if the backend sends it
}

interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  discount: number | null;
  discountExpiry: string | null;
  stock: number;
  imageUrl: string;
  images: string[];
  brand?: string | null;
  model?: string | null;
  features: string[];
  specifications?: any;
  availableColors: string[];
  availableSizes: string[];
  availableStorage: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string | Date;
    user: {
      name: string | null;
      email: string;
    };
  }>;
}

interface ShopDetailsClientProps {
  product: Product;
}

const ShopDetailsClient: React.FC<ShopDetailsClientProps> = ({ product }) => {
  const router = useRouter();

  const [activeDiscount, setActiveDiscount] = useState(product.discount || 0);
  useEffect(() => {
    // If no discount or no expiry, do nothing
    if (!product.discountExpiry || activeDiscount === 0) return;

    const expiryTime = new Date(product.discountExpiry).getTime();

    const checkExpiry = () => {
      const now = Date.now();
      if (now >= expiryTime) {
        setActiveDiscount(0); // Instantly update UI
        toast.error("The special offer for this product has ended.", {
          icon: '⏰',
          duration: 5000
        });

        // Refresh server data to ensure the 'Add to Cart' logic 
        // matches the new non-discounted price
        router.refresh();
        return true;
      }
      return false;
    };

    // Check immediately on mount
    if (checkExpiry()) return;

    // Set a timer for the exact moment it expires
    const timeRemaining = expiryTime - Date.now();
    const timer = setTimeout(() => {
      checkExpiry();
    }, timeRemaining);

    return () => clearTimeout(timer);
  }, [product.discountExpiry, activeDiscount, router]);

  // Replace your existing useMemos for availableColors, availableSizes, availableStorage
  const allAvailableColors = product.availableColors;
  const allAvailableSizes = product.availableSizes;
  const allAvailableStorage = product.availableStorage;

  // Helper to check if a specific attribute choice is valid with CURRENT other selections
  const isOptionCompatible = (type: 'color' | 'size' | 'storage', value: string) => {
    return product.variants.some((v) => {
      if (type === 'color') {
        return v.color === value &&
          (!selectedSize || v.size === selectedSize) &&
          (!selectedStorage || v.storage === selectedStorage);
      }
      if (type === 'size') {
        return v.size === value &&
          (!selectedColor || v.color === selectedColor) &&
          (!selectedStorage || v.storage === selectedStorage);
      }
      if (type === 'storage') {
        return v.storage === value &&
          (!selectedColor || v.color === selectedColor) &&
          (!selectedSize || v.size === selectedSize);
      }
      return false;
    });
  };

  // Replace handleColorChange, handleSizeChange, handleStorageChange
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setPreviewImg(0);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleStorageChange = (storage: string) => {
    setSelectedStorage(storage);
  };

  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();

  // Sync the product prop to the Redux store so the Modal can see it

  useEffect(() => {
    if (product) {
      const serializableProduct = {
        ...product,
        variants: product.variants.map(variant => ({
          ...variant,
          // Convert Date objects to strings safely
          createdAt: variant.createdAt instanceof Date
            ? variant.createdAt.toISOString()
            : String(variant.createdAt || ""),
          updatedAt: (variant as any).updatedAt instanceof Date
            ? (variant as any).updatedAt.toISOString()
            : String((variant as any).updatedAt || "")
        })),
        reviews: product.reviews?.map(review => ({
          ...review,
          createdAt: review.createdAt instanceof Date
            ? review.createdAt.toISOString()
            : String(review.createdAt)
        }))
      };

      dispatch(updateproductDetails(serializableProduct));
    }
  }, [product, dispatch]);

  // Find default variant once
  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];

  // State
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tabOne");

  // Initialize state directly with default variant
  const [selectedColor, setSelectedColor] = useState<string | null>(defaultVariant?.color || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(defaultVariant?.size || null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(defaultVariant?.storage || null);

  // Tabs configuration
  const tabs = [
    { id: "tabOne", title: "Description" },
    { id: "tabTwo", title: "Specifications" },
    { id: "tabThree", title: "Reviews" },
  ];

  // Find currently selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === selectedSize &&
        variant.storage === selectedStorage
    );
  }, [product.variants, selectedColor, selectedSize, selectedStorage]);

  // Get all images (variant images or product images)
  const allImages = useMemo(() => {
    const imgs: string[] = [];

    // Add variant-specific images first
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      imgs.push(...selectedVariant.images);
    }

    // Add main product image
    if (product.imageUrl) {
      imgs.push(product.imageUrl);
    }

    // Add additional product images
    if (product.images && product.images.length > 0) {
      imgs.push(...product.images);
    }

    // Remove duplicates
    return Array.from(new Set(imgs));
  }, [product.imageUrl, product.images, selectedVariant]);

  // Calculate prices based on selected variant
  const currentPrice = selectedVariant?.price || product.price;
  const hasDiscount = activeDiscount > 0; // Use local state
  const finalPrice = hasDiscount
    ? currentPrice * (1 - activeDiscount / 100) // Use local state
    : currentPrice;
  const currentStock = selectedVariant?.stock || product.stock;

  // Get available options based on current selection
  const availableColors = useMemo(() => {
    return product.availableColors.filter(color =>
      product.variants.some(v => v.color === color)
    );
  }, [product.availableColors, product.variants]);

  const availableSizes = useMemo(() => {
    // Filter sizes that are available for the selected color (and storage if selected)
    return product.availableSizes.filter(size =>
      product.variants.some(v => {
        const colorMatch = !selectedColor || v.color === selectedColor;
        const storageMatch = !selectedStorage || v.storage === selectedStorage;
        return v.size === size && colorMatch && storageMatch;
      })
    );
  }, [product.availableSizes, product.variants, selectedColor, selectedStorage]);

  const availableStorage = useMemo(() => {
    // Filter storage options that are available for the selected color and size
    return product.availableStorage.filter(storage =>
      product.variants.some(v => {
        const colorMatch = !selectedColor || v.color === selectedColor;
        const sizeMatch = !selectedSize || v.size === selectedSize;
        return v.storage === storage && colorMatch && sizeMatch;
      })
    );
  }, [product.availableStorage, product.variants, selectedColor, selectedSize]);

  // Handle variant selection with smart fallback
  // const handleColorChange = (color: string) => {
  //   setSelectedColor(color);
  //   setPreviewImg(0);

  //   // Check if current size/storage combination exists with new color
  //   const variantExists = product.variants.some(v => 
  //     v.color === color && 
  //     v.size === selectedSize && 
  //     v.storage === selectedStorage
  //   );

  //   if (!variantExists) {
  //     // Find the first available variant with this color
  //     const fallbackVariant = product.variants.find(v => v.color === color);
  //     if (fallbackVariant) {
  //       setSelectedSize(fallbackVariant.size || null);
  //       setSelectedStorage(fallbackVariant.storage || null);
  //     }
  //   }
  // };

  // const handleSizeChange = (size: string) => {
  //   setSelectedSize(size);

  //   // Check if current color/storage combination exists with new size
  //   const variantExists = product.variants.some(v => 
  //     v.color === selectedColor && 
  //     v.size === size && 
  //     v.storage === selectedStorage
  //   );

  //   if (!variantExists) {
  //     // Find the first available variant with this size and current color
  //     const fallbackVariant = product.variants.find(v => 
  //       v.size === size && 
  //       (!selectedColor || v.color === selectedColor)
  //     );
  //     if (fallbackVariant) {
  //       setSelectedStorage(fallbackVariant.storage || null);
  //       // Only change color if no color was selected
  //       if (!selectedColor) {
  //         setSelectedColor(fallbackVariant.color || null);
  //       }
  //     }
  //   }
  // };

  // const handleStorageChange = (storage: string) => {
  //   setSelectedStorage(storage);

  //   // Check if current color/size combination exists with new storage
  //   const variantExists = product.variants.some(v => 
  //     v.color === selectedColor && 
  //     v.size === selectedSize && 
  //     v.storage === storage
  //   );

  //   if (!variantExists) {
  //     // Find the first available variant with this storage and current color/size
  //     const fallbackVariant = product.variants.find(v => 
  //       v.storage === storage && 
  //       (!selectedColor || v.color === selectedColor) &&
  //       (!selectedSize || v.size === selectedSize)
  //     );
  //     if (fallbackVariant) {
  //       // Only change unselected attributes
  //       if (!selectedColor) {
  //         setSelectedColor(fallbackVariant.color || null);
  //       }
  //       if (!selectedSize) {
  //         setSelectedSize(fallbackVariant.size || null);
  //       }
  //     }
  //   }
  // };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select all product options");
      return;
    }

    if (currentStock === 0) {
      toast.error("This variant is out of stock");
      return;
    }

    if (quantity > currentStock) {
      toast.error(`Only ${currentStock} items available`);
      return;
    }

    // Optimistic update
    dispatch(
      addItemOptimistic({
        title: product.title,
        price: currentPrice,
        discountedPrice: finalPrice,
        quantity: quantity,
        image: allImages[0] || product.imageUrl,
        stock: currentStock,
        variantId: selectedVariant.id,
        color: selectedVariant.color,
        size: selectedVariant.size,
        storage: selectedVariant.storage,
        sku: selectedVariant.sku,
        product: {
          id: product.id,
          discount: product.discount,
          imageUrl: product.imageUrl,
          title: product.title,
          category: product.category.name,
        },
      })
    );

    try {
      await dispatch(
        addItemToCartAsync({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity: quantity,
        })
      ).unwrap();

      toast.success(`Added ${quantity} item(s) to cart`);
    } catch (err) {
      toast.error("Failed to add item to cart");
      console.error("Add to cart error:", err);
    }
  };

  // Get display title
  const displayTitle = useMemo(() => {
    if (product.brand && product.model) {
      return `${product.brand} ${product.model}`;
    }
    return product.title;
  }, [product.brand, product.model, product.title]);

  return (
    <>
      <Breadcrumb title="Shop Details" pages={["shop details"]} />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* Image Gallery Section */}
            <div className="lg:max-w-[570px] w-full">
              {/* Main Image Display */}
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                <button
                  onClick={openPreviewModal}
                  aria-label="button for zoom"
                  className="w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581Z"
                      fill=""
                    />
                  </svg>
                </button>

                <Image
                  src={allImages[previewImg] || product.imageUrl}
                  alt={displayTitle}
                  width={400}
                  height={400}
                  className="object-contain max-h-[400px]"
                  onError={(e) => {
                    e.currentTarget.src = "/images/products/product-1-bg-1.png";
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                  {allImages.map((img, key) => (
                    <button
                      onClick={() => setPreviewImg(key)}
                      key={key}
                      className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${key === previewImg ? "border-blue" : "border-transparent"
                        }`}
                    >
                      <Image
                        width={100}
                        height={100}
                        src={img}
                        alt={`Thumbnail ${key + 1}`}
                        onError={(e) => {
                          e.currentTarget.src = "/images/products/product-1-bg-1.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Content Section */}
            <div className="max-w-[539px] w-full">
              {/* Title and Discount Badge */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                  {product.title} | {product.model}
                </h2>

                {hasDiscount && (
                  <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                    {activeDiscount}% OFF
                  </div>
                )}
              </div>

              {/* Brand/Model */}
              {product.brand && (
                <p className="text-gray-600 mb-2">
                  by <span className="font-medium text-dark">{product.brand}</span>
                </p>
              )}

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-gray-600 mb-4">{product.shortDescription}</p>
              )}

              {/* Stock and Rating */}
              <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="fill-[#FFA645]"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_375_9172)">
                          <path
                            d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                            fill=""
                          />
                        </g>
                      </svg>
                    ))}
                  </div>
                  <span>({product.reviews?.length || 0} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_375_9221)">
                      <path
                        d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625Z"
                        fill="#22AD5C"
                      />
                      <path
                        d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                        fill="#22AD5C"
                      />
                    </g>
                  </svg>
                  <span className={currentStock > 0 ? "text-green" : "text-red"}>
                    {currentStock > 0 ? `In Stock (${currentStock})` : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Variant Selectors */}
              <div className="space-y-4 mb-6">
                {/* Color Selector */}
                {/* Example for Color Selector - Repeat this pattern for Size and Storage */}
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {allAvailableColors.map((color) => {
                      const compatible = isOptionCompatible('color', color);
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${selectedColor === color
                              ? "border-blue bg-blue text-white"
                              : "border-gray-300 hover:border-blue"
                            } ${!compatible ? "opacity-30 cursor-not-allowed bg-gray-100" : ""}`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selector */}
                {/* Example for Color Selector - Repeat this pattern for Size and Storage */}
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {allAvailableSizes.map((size) => {
                      const compatible = isOptionCompatible('size', size);
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeChange(size)}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${selectedSize === size
                              ? "border-blue bg-blue text-white"
                              : "border-gray-300 hover:border-blue"
                            } ${!compatible ? "opacity-30 cursor-not-allowed bg-gray-100" : ""}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Storage Selector */}
                {/* Example for Color Selector - Repeat this pattern for Size and Storage */}
                <div>
                  <label className="block text-sm font-medium mb-2">Storage</label>
                  <div className="flex flex-wrap gap-2">
                    {allAvailableStorage.map((storage) => {
                      const compatible = isOptionCompatible('storage', storage);
                      return (
                        <button
                          key={storage}
                          onClick={() => handleStorageChange(storage)}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${selectedStorage === storage
                              ? "border-blue bg-blue text-white"
                              : "border-gray-300 hover:border-blue"
                            } ${!compatible ? "opacity-30 cursor-not-allowed bg-gray-100" : ""}`}
                        >
                          {storage}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Variant Info */}
                {/* Selected Variant Confirmation - IMPROVED VERSION */}
                {selectedVariant && (
                  <div className="bg-green-light-6 border border-green-light-4 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-dark mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-bold text-green-dark text-sm mb-1">✓ Product Configuration Selected</p>
                      <div className="flex flex-wrap gap-2 text-xs text-dark-5">
                        {selectedVariant.color && (
                          <span className="bg-white px-2 py-1 rounded border border-green-light-4">
                            {selectedVariant.color}
                          </span>
                        )}
                        {selectedVariant.size && (
                          <span className="bg-white px-2 py-1 rounded border border-green-light-4">
                            {selectedVariant.size}
                          </span>
                        )}
                        {selectedVariant.storage && (
                          <span className="bg-white px-2 py-1 rounded border border-green-light-4">
                            {selectedVariant.storage}
                          </span>
                        )}
                        {selectedVariant.weight && (
                          <span className="bg-white px-2 py-1 rounded border border-green-light-4">
                            {selectedVariant.weight}kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-custom-1 text-dark">
                      ${finalPrice.toFixed(2)}
                    </span>
                    <span className="font-medium text-xl text-dark-4 line-through">
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span className="text-green-600 font-medium">
                      Save ${(currentPrice - finalPrice).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium text-custom-1 text-dark">
                    ${currentPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-wrap items-center gap-4.5">
                  {/* Quantity Selector */}
                  <div className="flex items-center rounded-md border border-gray-3">
                    <button
                      type="button"
                      aria-label="decrease quantity"
                      className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" />
                      </svg>
                    </button>

                    <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => quantity < currentStock && setQuantity(quantity + 1)}
                      aria-label="increase quantity"
                      className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                      disabled={quantity >= currentStock}
                    >
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" />
                        <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={currentStock === 0 || !selectedVariant}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {currentStock === 0
                      ? "Out of Stock"
                      : !selectedVariant
                        ? "Select Options"
                        : "Add to Cart"}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    aria-label="add to wishlist"
                    className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-3 ease-out duration-200 hover:text-white hover:bg-dark hover:border-transparent"
                  >
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.62436 4.42423C3.96537 5.18256 2.75 6.98626 2.75 9.13713C2.75 11.3345 3.64922 13.0283 4.93829 14.4798C6.00072 15.6761 7.28684 16.6677 8.54113 17.6346C8.83904 17.8643 9.13515 18.0926 9.42605 18.3219C9.95208 18.7366 10.4213 19.1006 10.8736 19.3649C11.3261 19.6293 11.6904 19.75 12 19.75C12.3096 19.75 12.6739 19.6293 13.1264 19.3649C13.5787 19.1006 14.0479 18.7366 14.574 18.3219C14.8649 18.0926 15.161 17.8643 15.4589 17.6346C16.7132 16.6677 17.9993 15.6761 19.0617 14.4798C20.3508 13.0283 21.25 11.3345 21.25 9.13713C21.25 6.98626 20.0346 5.18256 18.3756 4.42423C16.7639 3.68751 14.5983 3.88261 12.5404 6.02077C12.399 6.16766 12.2039 6.25067 12 6.25067C11.7961 6.25067 11.601 6.16766 11.4596 6.02077C9.40166 3.88261 7.23607 3.68751 5.62436 4.42423Z"
                        fill=""
                      />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Badge */}
              <div className="mt-6">
                <span className="text-sm text-gray-600">
                  Category:{" "}
                  <span className="text-blue font-medium">{product.category.name}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Tab Header */}
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === tab.id
                    ? "text-blue before:w-full"
                    : "text-dark before:w-0"
                  }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-10">
            {/* Description Tab */}
            {activeTab === "tabOne" && (
              <div className="rounded-xl bg-white shadow-1 p-6">
                <h3 className="font-medium text-2xl text-dark mb-4">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "tabTwo" && (
              <div className="rounded-2xl bg-white shadow-2 border border-gray-2 overflow-hidden font-euclid-circular-a">
                {/* Header with Background Tint */}
                <div className="px-8 py-6 border-b border-gray-2 bg-gray-1/30">
                  <h3 className="text-heading-6 font-bold text-dark">Technical Specifications</h3>
                  <p className="text-custom-xs text-body mt-1">Detailed breakdown of hardware and features.</p>
                </div>

                <div className="p-8">
                  {product.specifications && typeof product.specifications === "object" ? (
                    <div className="space-y-12">
                      {Object.entries(product.specifications).map(([section, specs]) => (
                        <div key={section} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

                          {/* Section Branding: Sticky-ish labels on the left for desktop */}
                          <div className="lg:col-span-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-1.5 h-6 bg-blue rounded-full" /> {/* Accent bar */}
                              <h4 className="font-bold text-dark text-lg capitalize">{section}</h4>
                            </div>
                          </div>

                          {/* Specs Grid: 2 columns on medium screens */}
                          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {typeof specs === "object" &&
                              Object.entries(specs as any).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex flex-col py-3 border-b border-gray-1 group hover:border-blue-light-4 transition-colors"
                                >
                                  <span className="text-2xs font-bold text-dark-5 uppercase tracking-widest mb-1 group-hover:text-blue transition-colors">
                                    {key}
                                  </span>
                                  <span className="text-custom-sm font-medium text-dark leading-relaxed">
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-1 rounded-full flex items-center justify-center text-xl mb-3">📋</div>
                      <p className="text-custom-sm font-bold text-dark-5">No specifications available for this model.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "tabThree" && (
              <div className="rounded-xl bg-white shadow-1 p-6">
                <h3 className="font-medium text-2xl text-dark mb-6">
                  Customer Reviews ({product.reviews?.length || 0})
                </h3>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-dark">
                            {review.user.name || "Anonymous"}
                          </span>
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <span key={i} className="text-yellow-500">
                                ★
                              </span>
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                              <span key={i} className="text-gray-300">
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.comment}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
};

export default ShopDetailsClient;