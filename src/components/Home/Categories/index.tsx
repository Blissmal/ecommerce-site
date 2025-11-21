"use client";

import { useState } from "react";
import clsx from "clsx";



interface Category {
  id: string;
  name: string;
  slug: string;
}

type Props = {
  categories: Category[];
};

export default function Categories({categories}: Props) {
  const [active, setActive] = useState("All");

  return (
    <section className="overflow-hidden pt-10 flex justify-center">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActive(category.name)}
              className={clsx(
                "inline-flex items-center h-10 px-5 text-sm truncate text-center rounded-2xl ring-0 cursor-pointer transition-all duration-200 ease-out",
                active === category.name
                  ? "bg-gray-7 text-white hover:bg-gray-6"
                  : "bg-gray-2 text-gray-7 hover:bg-gray-3"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
