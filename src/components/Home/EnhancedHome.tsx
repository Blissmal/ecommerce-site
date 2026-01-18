// Enhanced Home Component with Database Integration
// src/components/Home/EnhancedHome.tsx

import React from "react";
import Hero from "./Hero";
import Newsletter from "../Common/Newsletter";
import { prisma } from "../../../lib/prisma";
import EnhancedProductGrid from "./EnhancedProductGrid";

const EnhancedHome = async () => {
  // Fetch categories from database
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Fetch products with category info
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50 // Limit initial load
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Hero />

      {/* Search & Filter Section */}
      <EnhancedProductGrid 
        initialProducts={products} 
        categories={categories}
      />

      {/* Newsletter */}
      <Newsletter />
    </main>
  );
};

export default EnhancedHome;