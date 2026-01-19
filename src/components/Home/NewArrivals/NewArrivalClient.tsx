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
    <section id="newArrivals" className="relative py-24 lg:py-32 bg-white font-euclid-circular-a overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-light-5/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-light-5/20 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-[1240px] w-full mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-4 rounded-full bg-blue-light-5 text-blue font-bold text-2xs uppercase tracking-widest mb-4">
              Our Latest Collection
            </span>
            <h2 className="text-heading-3 md:text-heading-2 font-bold text-dark mb-4 tracking-tight">
              New Arrivals
            </h2>
            <p className="text-custom-lg text-body max-w-lg leading-relaxed">
              Experience the perfect blend of innovation and style with our newest hand-picked premium gear.
            </p>
          </div>
          
          <Link
            href="/shop-with-sidebar"
            className="group inline-flex items-center gap-2 font-bold text-blue hover:text-blue-dark transition-colors"
          >
            <span className="border-b-2 border-blue-light-3 group-hover:border-blue transition-all pb-0.5">
              Browse Full Catalog
            </span>
            <div className="bg-blue-light-5 p-2 rounded-full group-hover:bg-blue group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-14 overflow-x-auto no-scrollbar pb-4">
          {categories.map((category, index) => {
            const isActive = activeCategory === category;
            const count = category === "All" 
              ? products.length 
              : products.filter(p => p.category.name === category).length;

            return (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={clsx(
                  "group flex items-center gap-3 px-7 py-3.5 rounded-full font-bold text-custom-xs uppercase tracking-wider transition-all duration-300",
                  isActive
                    ? "bg-dark text-white shadow-3 -translate-y-1"
                    : "bg-meta border border-gray-3 text-dark-3 hover:border-blue-light-2 hover:bg-white"
                )}
              >
                {category}
                <span className={clsx(
                  "flex items-center justify-center min-w-[20px] h-5 px-1 rounded-md text-[10px] font-bold transition-colors",
                  isActive ? "bg-white/10 text-white" : "bg-gray-3 text-dark-5 group-hover:bg-blue-light-5 group-hover:text-blue"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div key={activeCategory} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {filteredProducts.map((item) => (
                <div key={item.id} className="hover:-translate-y-2 transition-transform duration-500">
                  <ProductItem item={item} />
                </div>
              ))}
            </div>

            {/* Premium CTA Card */}
            <div className="mt-24 relative overflow-hidden group">
              <div className="absolute inset-0 bg-dark rounded-[40px]" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-heading-5 md:text-heading-4 font-bold text-white mb-3">
                    Looking for something specific?
                  </h3>
                  <p className="text-meta-5 text-custom-lg">
                    Discover over <span className="text-blue-light-2 font-bold">{products.length}+</span> premium products in our vault.
                  </p>
                </div>
                <Link
                  href="/shop-with-sidebar"
                  className="whitespace-nowrap bg-blue text-white px-10 py-5 rounded-2xl font-bold shadow-lg shadow-blue/30 hover:bg-white hover:text-dark transition-all duration-300 active:scale-95"
                >
                  Explore Entire Shop
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-32 text-center bg-meta/50 border-2 border-dashed border-gray-3 rounded-[40px] flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-3 flex items-center justify-center text-3xl mb-6 animate-bounce">
              📦
            </div>
            <h3 className="text-heading-6 font-bold text-dark">Fresh Stock Loading</h3>
            <p className="text-body max-w-sm mx-auto mt-3">
              We're currently curating our <strong>{activeCategory}</strong> selection. 
              Join our newsletter to be the first to know when it drops!
            </p>
            <button 
              onClick={() => setActiveCategory("All")}
              className="mt-8 text-blue font-bold border-b-2 border-blue-light-4 hover:border-blue transition-all"
            >
              View Other Categories
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalClient;