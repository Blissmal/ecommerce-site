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
  discountExpiry: string | null;
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

  // UX Optimization: Calculate counts once to avoid re-filtering in the render loop
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    const uniqueNames = new Set<string>();

    products.forEach((p) => {
      uniqueNames.add(p.category.name);
      counts[p.category.name] = (counts[p.category.name] || 0) + 1;
    });

    return {
      list: ["All", ...Array.from(uniqueNames)],
      counts,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = activeCategory === "All" 
      ? products 
      : products.filter((p) => p.category.name === activeCategory);
    return filtered.slice(0, 8);
  }, [products, activeCategory]);

  return (
    <section id="newArrivals" className="relative py-20 lg:py-28 bg-white font-euclid-circular-a overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-light-6/40 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[25%] h-[25%] bg-blue-light-6/30 blur-[80px] rounded-full" />
      </div>

      <div className="relative max-w-screen-xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-light-6 text-blue font-bold text-[10px] uppercase tracking-[0.15em] mb-4 border border-blue-light-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
              Our Latest Collection
            </div>
            <h2 className="text-heading-3 md:text-heading-2 font-bold text-dark mb-3 tracking-tight leading-none">
              New Arrivals
            </h2>
            <p className="text-body max-w-md text-base md:text-lg">
              The freshest drops, hand-picked for the modern lifestyle.
            </p>
          </div>
          
          <Link
            href="/shop-with-sidebar"
            className="group flex items-center gap-3 font-bold text-dark hover:text-blue transition-all"
          >
            <span className="text-custom-sm uppercase tracking-wider">Browse Catalog</span>
            <div className="w-10 h-10 rounded-full border border-gray-3 flex items-center justify-center group-hover:bg-blue group-hover:border-blue group-hover:text-white transition-all duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
          </Link>
        </div>

        {/* Category Filter Pills with Scrolling Gradient */}
        <div className="relative mb-12 group/scroll">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 scroll-smooth">
            {categoryData.list.map((category, index) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={index}
                  onClick={() => setActiveCategory(category)}
                  className={clsx(
                    "whitespace-nowrap flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 border",
                    isActive
                      ? "bg-dark text-white border-dark shadow-xl -translate-y-0.5"
                      : "bg-white border-gray-2 text-body hover:border-dark hover:text-dark"
                  )}
                >
                  {category}
                  <span className={clsx(
                    "text-[9px] font-black opacity-60",
                    isActive ? "text-blue-light-3" : "text-dark-5"
                  )}>
                    ({categoryData.counts[category]})
                  </span>
                </button>
              );
            })}
          </div>
          {/* Mobile Scroll Indicator Mask */}
          <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
        </div>

        {/* Products Grid with Entrance Animation */}
        {filteredProducts.length > 0 ? (
          <div key={activeCategory} className="animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map((item) => (
                <div key={item.id} className="group/item">
                  <ProductItem item={item} />
                </div>
              ))}
            </div>

            {/* Premium CTA Card - Refined Spacing */}
            <div className="mt-20 group">
              <div className="relative p-8 md:p-14 bg-dark rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Abstract Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                
                <div className="relative z-10 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Not finding the right fit?
                  </h3>
                  <p className="text-gray-400 font-medium">
                    Explore our vault of <span className="text-white">{products.length}+</span> premium products.
                  </p>
                </div>
                <Link
                  href="/shop-with-sidebar"
                  className="relative z-10 bg-blue text-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-dark transition-all duration-300 shadow-lg shadow-blue/20"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State - More Compact and Clean */
          <div className="py-24 text-center border-2 border-dashed border-gray-2 rounded-3xl bg-gray-1/30">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-dark">Fresh drops coming soon</h3>
            <p className="text-dark-5 mt-2 mb-6">We're updating the {activeCategory} collection.</p>
            <button 
              onClick={() => setActiveCategory("All")}
              className="text-blue font-bold hover:underline"
            >
              Back to all arrivals
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalClient;