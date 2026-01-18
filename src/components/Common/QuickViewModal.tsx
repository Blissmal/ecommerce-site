"use client";
import React, { useEffect, useState, useMemo } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { resetQuickView } from "@/redux/features/quickView-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemOptimistic, addItemToCartAsync } from "@/redux/features/cart-slice";

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch<AppDispatch>();

  // get the product data
  const product = useAppSelector((state) => state.quickViewReducer.value);

  const [activePreview, setActivePreview] = useState(0);

  // Get all product images (database imageUrl + images array OR old demo data)
  const allImages = useMemo(() => {
    // If product is null/undefined, return empty array
    if (!product) return [];

    const imgs = [];
    
    // Try database fields first
    if (product.imageUrl) {
      imgs.push(product.imageUrl);
    }
    
    if (product.images && Array.isArray(product.images)) {
      imgs.push(...product.images);
    }
    
    // Fallback to old demo data structure
    if (imgs.length === 0 && product.imgs?.previews) {
      return product.imgs.previews;
    }
    
    // Final fallback - placeholder
    if (imgs.length === 0) {
      imgs.push("/images/products/product-1-bg-1.png");
    }
    
    return imgs;
  }, [product]);

  // preview modal
  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(product));
    openPreviewModal();
  };

  // add to cart
  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addItemOptimistic({
        id: String(product.id),
        title: product.title,
        price: product.price,
        discountedPrice:
          product.discount !== null
            ? product.price - (product.price * (product.discount / 100))
            : product.price,
        quantity: quantity,
        image: product.imageUrl || allImages[0], // Use imageUrl or first image
        stock: product.stock,
      })
    );

    dispatch(
      addItemToCartAsync({
        productId: String(product.id),
        quantity: quantity,
      })
    );
  };

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
    };
  }, [isModalOpen, closeModal]);

  // Don't render if no product
  if (!product) return null;

  const currentImage = allImages[activePreview];
  const hasMultipleImages = allImages.length > 1;

  return (
    <div
      className={`${
        isModalOpen ? "z-99999" : "hidden"
      } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5`}
    >
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={() => closeModal()}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div className="flex flex-wrap items-center gap-12.5">
            <div className="max-w-[526px] w-full">
              <div className="flex gap-5">
                {/* Thumbnail Images - Only show if there are multiple images */}
                {hasMultipleImages && (
                  <div className="flex flex-col gap-5">
                    {allImages.map((img, key) => (
                      <button
                        onClick={() => setActivePreview(key)}
                        key={key}
                        className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue ${
                          activePreview === key && "border-2 border-blue"
                        }`}
                      >
                        <Image
                          src={img || "/images/products/product-1-bg-1.png"}
                          alt={`thumbnail-${key}`}
                          width={61}
                          height={61}
                          className="aspect-square object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image Display */}
                <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[508px] bg-gray-1 rounded-lg border border-gray-3">
                  <div>
                    <button
                      onClick={handlePreviewSlider}
                      aria-label="button for zoom"
                      className="gallery__Image w-10 h-10 rounded-[5px] bg-white shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-8 right-4 lg:right-8 z-50"
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
                          d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    {currentImage ? (
                      <Image
                        src={currentImage}
                        alt={product?.title || "product image"}
                        width={400}
                        height={400}
                        className="rounded-xl object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[400px]">
                        <p className="text-sm text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="max-w-[445px] w-full">
              {product.discount && product.discount > 0 && (
                <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-green mb-6.5">
                  SALE {product.discount}% OFF
                </span>
              )}

              <h3 className="font-semibold text-xl xl:text-heading-5 text-dark mb-4">
                {product.title}
              </h3>

              <div className="flex flex-wrap items-center gap-5 mb-6">
                <div className="flex items-center gap-1.5">
                  {/* Stars - you can make this dynamic later */}
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
                  <span className="text-sm text-gray-600">(0 reviews)</span>
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
                        d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                        fill="#22AD5C"
                      />
                      <path
                        d="M12.6875 7.09375L8.96875 10.7188L7.28125 9.0625C6.9375 8.71875 6.40625 8.71875 6.0625 9.0625C5.71875 9.40625 5.71875 9.9375 6.0625 10.2812L8.34375 12.5625C8.53125 12.75 8.75 12.8125 8.96875 12.8125C9.1875 12.8125 9.40625 12.7188 9.59375 12.5625L13.9375 8.28125C14.2812 7.9375 14.2812 7.40625 13.9375 7.0625C13.5938 6.75 13.0312 6.75 12.6875 7.09375Z"
                        fill="#22AD5C"
                      />
                    </g>
                  </svg>
                  <span className="text-sm text-gray-600">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 mb-7.5">
                {product.discount && product.discount > 0 ? (
                  <>
                    <span className="font-bold text-heading-4 text-dark">
                      ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                    <span className="font-medium text-xl text-gray-5 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-heading-4 text-dark">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="mb-8 text-gray-600">
                {product.description || "No description available"}
              </p>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-5 mb-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-3 rounded hover:bg-gray-1"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-3 rounded hover:bg-gray-1"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 h-12 rounded bg-blue text-white font-medium hover:bg-blue-dark transition-colors disabled:bg-gray-3 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 text-sm text-gray-600">
                {product.category && (
                  <div className="flex gap-2">
                    <span className="font-medium text-dark">Category:</span>
                    <span>{product.category.name}</span>
                  </div>
                )}
                {allImages.length > 1 && (
                  <div className="flex gap-2">
                    <span className="font-medium text-dark">Images:</span>
                    <span>{allImages.length} available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;