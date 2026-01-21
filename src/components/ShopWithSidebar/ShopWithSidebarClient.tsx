"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  RotateCcw,
  ArrowUpDown
} from "lucide-react";
import Breadcrumb from "../Common/Breadcrumb";
import ProductItem from "../Common/ProductItem";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number | null;
  discountExpiry: string | null;
  stock: number;
  imageUrl: string;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  reviews?: number;
  discountedPrice?: number;
  // Legacy fields for backwards compatibility
  imgs?: {
    thumbnails?: string[];
    previews?: string[];
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
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");

  // NEW: Track current time for discount expiry checks
  const [currentTime, setCurrentTime] = useState(new Date());

  // NEW: Update current time every minute to check discount expiries
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const maxPriceLimit = useMemo(() => Math.max(...products.map((p) => p.price), 1000), [products]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // NEW: Process products to handle expired discounts
  const processedProducts = useMemo(() => {
    return products.map((product) => {
      const hasExpired = product.discountExpiry && new Date(product.discountExpiry) < currentTime;
      const activeDiscount = hasExpired ? 0 : product.discount;
      
      return {
        ...product,
        discount: activeDiscount,
        discountedPrice: activeDiscount 
          ? product.price - (product.price * activeDiscount) / 100
          : product.price,
      };
    });
  }, [products, currentTime]);

  const filteredProducts = useMemo(() => {
    let filtered = [...processedProducts];
    
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category.id));
    }
    
    // NEW: Filter by discounted price if discount exists, otherwise regular price
    filtered = filtered.filter((p) => {
      const effectivePrice = p.discountedPrice || p.price;
      return effectivePrice >= priceRange.min && effectivePrice <= priceRange.max;
    });

    return filtered.sort((a, b) => {
      const priceA = a.discountedPrice || a.price;
      const priceB = b.discountedPrice || b.price;
      
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "discount") return (b.discount || 0) - (a.discount || 0);
      return 0;
    });
  }, [processedProducts, searchTerm, selectedCategories, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: maxPriceLimit });
    setSearchTerm("");
  };

  // NEW: Count products with active discounts
  const discountedCount = useMemo(() => {
    return processedProducts.filter(p => p.discount && p.discount > 0).length;
  }, [processedProducts]);

  return (
    <div className="bg-white font-euclid-circular-a">
      <Breadcrumb title="Shop Collection" pages={["Shop"]} />

      <section className="relative max-w-screen-xl mx-auto px-6 py-15 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-12.5">

          {/* --- SIDEBAR FILTER --- */}
          <aside className={`
            fixed inset-y-0 left-0 z-99999 w-[300px] bg-white p-8 shadow-3 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none lg:p-0 lg:z-1 lg:w-1/4
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            <div className="sticky top-30 space-y-10">
              <div className="flex items-center justify-between lg:hidden">
                <h2 className="text-custom-1 font-bold text-dark">Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)}><X className="text-dark" /></button>
              </div>

              {/* NEW: Discount Badge */}
              {discountedCount > 0 && (
                <div className="p-4 bg-gradient-to-br from-blue-light-6 to-blue-light-5 rounded-xl border border-blue-light-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔥</span>
                    <h3 className="text-custom-sm font-bold text-dark">Active Deals</h3>
                  </div>
                  <p className="text-2xs text-dark-5">
                    <span className="font-bold text-blue">{discountedCount}</span> products on sale
                  </p>
                </div>
              )}

              {/* Search */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-dark-5">Search Products</h3>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-5 group-focus-within:text-blue transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-1 border border-gray-3 rounded-xl focus:ring-1 focus:ring-blue focus:border-blue transition-all outline-none text-dark"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-dark-5">Category</h3>
                <div className="flex flex-col gap-3.5">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center group cursor-pointer">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => setSelectedCategories(prev =>
                            prev.includes(cat.id) ? prev.filter(i => i !== cat.id) : [...prev, cat.id]
                          )}
                          className="peer appearance-none w-5 h-5 border border-gray-4 rounded-md checked:bg-blue checked:border-blue transition-all"
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white left-0.5 pointer-events-none hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="ml-3 text-body group-hover:text-dark transition-colors font-medium">{cat.name}</span>
                      <span className="ml-auto text-2xs font-bold text-dark-5 bg-gray-2 px-2 py-0.5 rounded-full">{cat._count.products}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-dark-5">Price Range</h3>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max={maxPriceLimit}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full h-1.5 bg-gray-3 rounded-lg appearance-none cursor-pointer accent-blue"
                  />
                  <div className="flex justify-between mt-3">
                    <span className="text-custom-xs font-bold text-dark">$0</span>
                    <span className="text-custom-xs font-bold text-blue">${priceRange.max}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 py-4 border border-gray-3 text-dark rounded-xl font-bold hover:bg-gray-1 transition-all"
              >
                <RotateCcw size={16} /> Reset Filters
              </button>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className={`
              flex items-center justify-between mb-10 pb-6 border-b border-gray-3 transition-all duration-300
              ${isScrolled ? "sticky top-2 z-99 shadow-2 bg-white/90 backdrop-blur-md p-4 rounded-2xl" : ""}
            `}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2.5 bg-gray-1 rounded-lg text-dark"
                >
                  <SlidersHorizontal size={20} />
                </button>
                <p className="text-body font-medium">
                  Result: <span className="text-dark font-bold">{filteredProducts.length}</span> items
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 bg-gray-1 p-1 rounded-xl border border-gray-3">
                  <button
                    onClick={() => setProductStyle("grid")}
                    className={`p-2 rounded-lg transition-all ${productStyle === "grid" ? "bg-white text-blue shadow-1" : "text-dark-5"}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setProductStyle("list")}
                    className={`p-2 rounded-lg transition-all ${productStyle === "list" ? "bg-white text-blue shadow-1" : "text-dark-5"}`}
                  >
                    <List size={18} />
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-3 rounded-xl text-custom-sm font-bold text-dark outline-none cursor-pointer focus:border-blue"
                  >
                    <option value="latest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Best Discount</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-5 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${productStyle}-${selectedCategories.join(",")}-${searchTerm}`}
                initial="hidden"
                animate="show"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  },
                  exit: { opacity: 0, transition: { duration: 0.2 } }
                }}
                className={productStyle === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7.5"
                  : "flex flex-col gap-7.5"
                }
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <ProductItem item={product} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-40 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-1 rounded-full mb-6">
                      <Search size={32} className="text-gray-4" />
                    </div>
                    <h3 className="text-custom-1 font-bold text-dark mb-2">No items found</h3>
                    <p className="text-body max-w-xs mx-auto mb-8">Adjust your filters to discover our premium collections.</p>
                    <button onClick={clearFilters} className="px-8 py-3 bg-blue text-white rounded-xl font-bold shadow-2 hover:bg-blue-dark transition-all">
                      Reset all filters
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopWithSidebarClient;