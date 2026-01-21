import React from "react";
import { prisma } from "../../../../../lib/prisma";
import { Metadata } from "next";
import ShopWithSidebarClient from "@/components/ShopWithSidebar/ShopWithSidebarClient";
import PriceSyncNotifier from "@/components/Common/PriceSyncNotifier";

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
      reviews: true,
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

  const now = new Date();

  // Map products with discount expiry handling and ensure clean serializable data
  const mappedProducts = products.map((product) => {
    const hasExpired = product.discountExpiry && new Date(product.discountExpiry) < now;
    const activeDiscount = hasExpired ? 0 : product.discount;
    
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      discount: activeDiscount,
      discountExpiry: product.discountExpiry ? new Date(product.discountExpiry).toISOString() : null,
      stock: product.stock,
      imageUrl: product.imageUrl,
      images: product.images || [],
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      reviews: product.reviews?.length || 0,
      discountedPrice: activeDiscount 
        ? product.price - (product.price * activeDiscount) / 100
        : undefined,
    };
  });

  // Collect all expiry dates for PriceSyncNotifier
  const allExpiries = mappedProducts
    .map(p => p.discountExpiry)
    .filter(Boolean) as string[];

  return (
    <main>
      {allExpiries.length > 0 && <PriceSyncNotifier expiryDates={allExpiries} />}
      <ShopWithSidebarClient products={mappedProducts} categories={categories} />
    </main>
  );
};

export default ShopWithSidebarPage;