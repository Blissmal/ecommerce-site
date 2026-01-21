import React from 'react'
import NewArrivalClient from './NewArrivalClient'
import { prisma } from '../../../../lib/prisma';
import CounDown from '../Countdown';
import PriceSyncNotifier from '@/components/Common/PriceSyncNotifier';

const NewArrival = async () => {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      stock: {
        gt: 0,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
    select: {
      id: true,
      title: true,
      price: true,
      discount: true,
      discountExpiry: true,
      reviews: true,
      imageUrl: true,
      images: true, // Add images array
      description: true,
      stock: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const now = new Date();

  // Map reviews to their count and ensure clean serializable data
  const mappedProducts = products.map((product) => {
    const hasExpired = product.discountExpiry && new Date(product.discountExpiry) < now;
    const activeDiscount = hasExpired ? 0 : product.discount;
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      discount: activeDiscount,
      discountExpiry: product.discountExpiry ? new Date(product.discountExpiry).toISOString() : null,
      reviews: product.reviews.length,
      imageUrl: product.imageUrl,
      images: product.images || [],
      description: product.description,
      stock: product.stock,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
    }
  });

  const featuredProduct = mappedProducts
    .filter(p => p.discountExpiry && p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))[0] || null;

  const allExpiries = mappedProducts.map(p => p.discountExpiry); // Collect all expiry dates

  return (
    <>
      <PriceSyncNotifier expiryDates={allExpiries} /> {/* Inject notifier for price sync */}
      <NewArrivalClient products={mappedProducts} />
      {featuredProduct && (
        <CounDown 
          deadline={featuredProduct.discountExpiry} 
          title={featuredProduct.title}
          id={featuredProduct.id}
          imageUrl={featuredProduct.imageUrl}
          discount={featuredProduct.discount}
        />
      )}
    </>
  )
}

export default NewArrival