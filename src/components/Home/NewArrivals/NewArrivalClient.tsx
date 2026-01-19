"use client";
import React, { useState, useMemo } from "react";
import ProductItem from "@/components/Common/ProductItem";
import Link from "next/link";
import clsx from "clsx";

type Product = {
  id: string;
  title: string;
  price: number;
  discount: number | null;
  reviews: number;
  imageUrl: string;
  images: string[];
  description: string;
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

const NewArrivalClient = ({ products }: { products: Product[] }) => {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category.name))
    );
    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = activeCategory === "All" 
      ? products 
      : products.filter((p) => p.category.name === activeCategory);
    return filtered.slice(0, 8);
  }, [products, activeCategory]);

  return (
    <section id="newArrivals" className="py-20 lg:py-28 bg-white font-euclid-circular-a">
      <div className="max-w-[1240px] w-full mx-auto px-6">
        
        {/* Section Header - More spacious and bold */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-heading-3 font-bold text-dark mb-3 tracking-tight">
              New Arrivals
            </h2>
            <p className="text-custom-sm text-body leading-relaxed">
              Discover the latest additions to our collection. Hand-picked quality 
              gear designed for your lifestyle.
            </p>
          </div>
          
          <Link
            href="/shop-with-sidebar"
            className="group inline-flex items-center gap-3 font-bold text-blue border-b-2 border-blue-light-4 pb-1 hover:border-blue transition-all"
          >
            Browse Full Catalog
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Premium Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
          {categories.map((category, index) => {
            const count = category === "All" 
              ? products.length 
              : products.filter(p => p.category.name === category).length;

            return (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-custom-xs uppercase tracking-widest transition-all duration-300 border shadow-sm",
                  activeCategory === category
                    ? "bg-dark text-white border-dark shadow-xl shadow-dark/10 -translate-y-0.5"
                    : "bg-white text-dark-5 border-gray-3 hover:border-blue-light-4 hover:bg-gray-1"
                )}
              >
                {category}
                <span className={clsx(
                  "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                  activeCategory === category ? "bg-white/20 text-white" : "bg-gray-2 text-dark-5"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid with simple Fade-In logic */}
        {filteredProducts.length > 0 ? (
          <div key={activeCategory} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((item, key) => (
                <div key={item.id} className="transition-all duration-300">
                  <ProductItem item={item} />
                </div>
              ))}
            </div>

            {/* Bottom CTA - Integrated into the page flow */}
            <div className="mt-20 p-12 bg-gray-1 rounded-[32px] border border-gray-2 flex flex-col items-center text-center">
              <h3 className="text-heading-6 font-bold text-dark mb-2">Haven't found what you're looking for?</h3>
              <p className="text-custom-sm text-body mb-8">We have over {products.length}+ more items waiting for you.</p>
              <Link
                href="/shop-with-sidebar"
                className="bg-blue text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue/20 hover:bg-blue-dark hover:scale-[1.02] transition-all"
              >
                Explore All Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-gray-2 rounded-[32px]">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-custom-lg font-bold text-dark">Coming Soon</h3>
            <p className="text-custom-sm text-body max-w-xs mx-auto mt-2">
              We're currently updating our {activeCategory} stock. Check back in a few days!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalClient;