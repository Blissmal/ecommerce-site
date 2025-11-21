"use client";
import React, { useState } from "react";
import ProductItem from "@/components/Common/ProductItem";

type Product = {
  id: string;
  title: string;
  price: number;
  discount: number | null;
  reviews: number;
  imageUrl: string;
  description: string;
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

const NewArrivalClient = ({ products }: { products: Product[] }) => {
  const categories = [
    "All",
    "Beanies",
    "Belts",
    "Bucket Hats",
    "CAPS",
    "clothes",
    "Glasses",
    "Links",
    "Perfumes",
    "Shoes",
    "Socks",
  ];

  const [active, setActive] = useState("All");

  return (
    <section className="overflow-hidden py-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {products.map((item, key) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivalClient;
