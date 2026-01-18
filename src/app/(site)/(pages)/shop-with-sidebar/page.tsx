import React from "react";
import { prisma } from "../../../../../lib/prisma";

import { Metadata } from "next";
import ShopWithSidebarClient from "@/components/ShopWithSidebar/ShopWithSidebarClient";
export const metadata: Metadata = {
  title: "Shop Page | NextCommerce E-commerce",
  description: "Browse our complete product collection with advanced filters",
};

const ShopWithSidebarPage = async () => {
  // Fetch all products from database
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all categories
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return (
    <main>
      <ShopWithSidebarClient products={products} categories={categories} />
    </main>
  );
};

export default ShopWithSidebarPage;