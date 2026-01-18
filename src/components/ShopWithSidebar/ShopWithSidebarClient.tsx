"use client";
import React, { useState, useMemo } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import ProductItem from "../Common/ProductItem";
import Image from "next/image";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number | null;
  stock: number;
  imageUrl: string;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
};

interface Props {
  products: Product[];
  categories: Category[];
}

const ShopWithSidebarClient = ({ products, categories }: Props) => {
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");

  const sortOptions = [
    { label: "Latest Products", value: "latest" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Name: A to Z", value: "name-asc" },
  ];

  // Get max price for slider
  const maxPrice = useMemo(() => {
    return Math.max(...products.map((p) => p.price), 1000);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category.id)
      );
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
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "latest":
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategories, priceRange, sortBy]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: maxPrice });
    setSearchTerm("");
    setSortBy("latest");
  };

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 80) {
        setStickyMenu(true);
      } else {
        setStickyMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Close sidebar when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    };

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  return (
    <>
      <Breadcrumb title="Shop" pages={["shop"]} />

      <section className="overflow-hidden py-15 lg:py-20">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* Sidebar */}
            <div
              className={`sidebar-content max-w-[295px] w-full lg:static fixed top-0 ${
                productSidebar ? "left-0" : "-left-[400px]"
              } h-screen lg:h-auto overflow-y-auto no-scrollbar bg-white shadow-lg lg:shadow-none z-99999 ease-linear duration-300 lg:ease-out`}
            >
              <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-gray-3">
                <h3 className="font-medium text-lg text-dark">Filters</h3>
                <button
                  onClick={() => setProductSidebar(false)}
                  className="text-dark hover:text-blue"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-7.5">
                {/* Search */}
                <div className="mb-8">
                  <h4 className="font-medium text-lg text-dark mb-4">Search</h4>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-3 rounded-md focus:ring-2 focus:ring-blue focus:border-blue"
                    />
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-8 pb-8 border-b border-gray-3">
                  <h4 className="font-medium text-lg text-dark mb-4">Categories</h4>
                  <div className="flex flex-col gap-3">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryToggle(category.id)}
                            className="w-4 h-4 text-blue border-gray-3 rounded focus:ring-blue cursor-pointer"
                          />
                          <span className="text-dark group-hover:text-blue transition-colors">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({category._count.products})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8 pb-8 border-b border-gray-3">
                  <h4 className="font-medium text-lg text-dark mb-4">Price Range</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>${priceRange.min}</span>
                      <span>${priceRange.max}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearAllFilters}
                  className="w-full py-3 bg-gray-100 text-dark rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Products Area */}
            <div className="w-full">
              {/* Top Bar */}
              <div
                className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-5 mb-7.5 pb-7.5 border-b border-gray-3 ${
                  stickyMenu ? "sticky top-0 bg-white z-999 py-5" : ""
                }`}
              >
                <div className="flex items-center gap-5">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setProductSidebar(!productSidebar)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-3 rounded-md hover:bg-gray-100"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.33301 5.83333H16.6663M5.83301 10H14.1663M8.33301 14.1667H11.6663"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Filters
                  </button>

                  <p className="font-medium text-dark">
                    Showing {filteredProducts.length} of {products.length} results
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2.5 border border-gray-3 rounded-md focus:ring-2 focus:ring-blue focus:border-blue"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center border border-gray-3 rounded-md overflow-hidden">
                    <button
                      onClick={() => setProductStyle("grid")}
                      className={`p-2.5 ${
                        productStyle === "grid" ? "bg-blue text-white" : "text-dark"
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current"
                      >
                        <path d="M3 3H8V8H3V3ZM11 3H16V8H11V3ZM11 11H16V16H11V11ZM3 11H8V16H3V11Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setProductStyle("list")}
                      className={`p-2.5 border-l border-gray-3 ${
                        productStyle === "list" ? "bg-blue text-white" : "text-dark"
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current"
                      >
                        <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {filteredProducts.length > 0 ? (
                <div
                  className={
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5"
                      : "flex flex-col gap-7.5"
                  }
                >
                  {filteredProducts.map((product, key) => (
                    <ProductItem key={key} item={product} />
                  ))}
                </div>
              ) : (
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebarClient;