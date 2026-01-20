"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative bg-white pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden font-euclid-circular-a">
      {/* Background Decor - Minimalist for general feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue/5 rounded-full blur-[120px] -z-10 opacity-60" />

      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* 1. Content Side */}
          <div className="order-2 lg:order-1 text-center lg:text-left space-y-8">
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="px-3 py-1 rounded-full bg-gray-1 border border-gray-2 text-dark-5 text-[10px] font-bold uppercase tracking-widest">
                #1 Marketplace
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-light-6 border border-blue-light-4 text-blue-dark text-[10px] font-bold uppercase tracking-widest">
                New Arrivals
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl xl:text-7xl font-bold text-dark leading-[1.1] tracking-tight">
              Quality Finds for <br />
              <span className="text-blue">Every Lifestyle.</span>
            </h1>

            <p className="text-body text-dark-5 max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed">
              From the latest <span className="text-dark font-semibold">Mobiles</span> to premium 
              <span className="text-dark font-semibold"> Footwear</span>. Explore 
              curated collections designed for your daily needs.
            </p>

            {/* General CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-10 py-4 bg-blue text-white rounded-xl font-bold shadow-2 hover:bg-blue-dark transition-all transform hover:-translate-y-1 text-center"
              >
                Shop All Products
              </Link>
              <Link
                href="#categories"
                className="w-full sm:w-auto px-10 py-4 bg-white text-dark border border-gray-3 rounded-xl font-bold hover:bg-gray-1 transition-all text-center"
              >
                Explore Categories
              </Link>
            </div>

            {/* Quick Category Icons - Reinforces the "General" aspect */}
            <div className="pt-6 flex flex-wrap justify-center lg:justify-start gap-6 opacity-70">
              <div className="flex items-center gap-2 text-custom-xs font-bold text-dark uppercase tracking-tighter">
                <span className="text-lg">📱</span> Mobiles
              </div>
              <div className="flex items-center gap-2 text-custom-xs font-bold text-dark uppercase tracking-tighter">
                <span className="text-lg">👟</span> Shoes
              </div>
              <div className="flex items-center gap-2 text-custom-xs font-bold text-dark uppercase tracking-tighter">
                <span className="text-lg">👕</span> Fashion
              </div>
              <div className="flex items-center gap-2 text-custom-xs font-bold text-dark uppercase tracking-tighter">
                <span className="text-lg">🎧</span> Gadgets
              </div>
            </div>
          </div>

          {/* 2. Image Side (The Fix) */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <div className="relative w-full max-w-[550px] aspect-square lg:aspect-[4/5] xl:aspect-square group">
              {/* This container ensures the image never stretches the height of the text */}
              <div className="absolute inset-0 bg-gray-1 rounded-[2rem] -rotate-3 group-hover:rotate-0 transition-transform duration-500 -z-10" />
              
              <Image
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop" 
                alt="General Store Showcase"
                fill
                className="object-cover rounded-[2rem] shadow-4 border-4 border-white transition-transform duration-700 group-hover:scale-[1.02]"
                priority
              />
              
              {/* Floats for visual interest - reinforces category diversity */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-3 hidden sm:block animate-bounce-slow">
                <p className="text-[10px] font-bold text-dark-5 uppercase">Next Gen</p>
                <p className="text-sm font-bold text-dark">Mobile Tech</p>
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-3 hidden sm:block animate-bounce-slow delay-700">
                <p className="text-[10px] font-bold text-dark-5 uppercase">Premium</p>
                <p className="text-sm font-bold text-dark">Footwear</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;