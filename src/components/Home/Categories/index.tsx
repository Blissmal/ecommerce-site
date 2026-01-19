"use client";

import { useState } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

type Props = {
  categories: Category[];
};

export default function CategoryExplorer({ categories }: Props) {
  return (
    <section id="categories" className="py-20 bg-meta font-euclid-circular-a">
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 border-b border-gray-3 pb-6">
          <div>
            <h2 className="text-heading-4 font-bold text-dark">Shop by Category</h2>
            <p className="text-custom-sm text-body mt-1">Explore our curated collections across all departments.</p>
          </div>
          <span className="text-2xs font-bold text-dark-5 uppercase tracking-widest hidden sm:block">
            {categories.length} Collections Available
          </span>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop-with-sidebar`}
              className="group relative flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-3 shadow-1 hover:shadow-4 hover:border-blue transition-all duration-300 overflow-hidden text-center"
            >
              {/* Decorative Circle Icon Wrapper */}
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-1 flex items-center justify-center text-2xl group-hover:bg-blue-light-6 group-hover:scale-110 transition-all duration-300 border border-transparent group-hover:border-blue-light-4">
                {/* Fallback for icons: You can map specific icons to category names here */}
                {/* {category.name.toLowerCase().includes('electronic') ? '🎧' : 
                 category.name.toLowerCase().includes('fashion') ? '👕' : 
                 category.name.toLowerCase().includes('home') ? '🏠' : '📦'} */}
              </div>

              <h3 className="text-custom-sm font-bold text-dark group-hover:text-blue transition-colors">
                {category.name}
              </h3>
              
              <div className="mt-2 flex items-center text-2xs font-bold text-blue uppercase tracking-tighter opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Explore Items →
              </div>

              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}