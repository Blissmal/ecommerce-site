"use client";
import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="bg-white py-20 lg:py-28 xl:py-36 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Hero image */}
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
            <Image
              src="/hero.png"
              alt="Hero image"
              width={400}
              height={340}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Optional CTA */}
          {/* <div className="mt-8">
            <button className="px-6 py-3 bg-primary-color text-white rounded-lg hover:bg-primary-color/90">
              Shop Now
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
