// Enhanced Product Grid with Search & Filtering
// src/components/Home/EnhancedProductGrid.tsx

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  images?: string[];
  discount?: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function EnhancedProductGrid({ initialProducts, categories }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "name">("newest");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category.id === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(
      (product) => product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return 0; // Already sorted by createdAt desc
      }
    });

    return filtered;
  }, [initialProducts, searchTerm, selectedCategory, sortBy, priceRange]);

  // Get max price for range slider
  const maxPrice = useMemo(() => {
    return Math.max(...initialProducts.map((p) => p.price), 1000);
  }, [initialProducts]);

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Shop Our Products
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} products found
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({initialProducts.length})
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name} ({category._count.products})
                  </button>
                ))}
              </div>

              {/* Sort & View Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Price Range:</span>
                <span className="text-sm text-gray-600">
                  ${priceRange.min} - ${priceRange.max}
                </span>
              </div>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setPriceRange({ min: 0, max: maxPrice });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Product Card Component (Grid View)
function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/shop-details?id=${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.imageUrl || "/images/products/product-1-bg-1.png"}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{product.discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/shop-details?id=${product.id}`}>
          <span className="text-xs text-blue-600 font-medium mb-1 block">
            {product.category.name}
          </span>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  ${finalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => router.push(`/shop-details?id=${product.id}`)}
            disabled={product.stock === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? "Sold Out" : "View"}
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-600 mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </div>
  );
}

// Product List Item Component (List View)
function ProductListItem({ product }: { product: Product }) {
  const router = useRouter();
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <Link
          href={`/shop-details?id=${product.id}`}
          className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
        >
          <Image
            src={product.imageUrl || "/images/products/product-1-bg-1.png"}
            alt={product.title}
            fill
            className="object-cover"
          />
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              -{product.discount}%
            </div>
          )}
        </Link>

        <div className="flex-1 flex flex-col">
          <Link href={`/shop-details?id=${product.id}`}>
            <span className="text-xs text-blue-600 font-medium mb-1 block">
              {product.category.name}
            </span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
          </Link>

          <p className="text-gray-600 mb-4 flex-1">{product.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.discount && product.discount > 0 ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">
                    ${finalPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {product.stock > 0 ? (
                <span className="text-sm text-gray-600">
                  {product.stock} in stock
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Out of stock</span>
              )}

              <button
                onClick={() => router.push(`/shop-details?id=${product.id}`)}
                disabled={product.stock === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Sold Out" : "View Details"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}