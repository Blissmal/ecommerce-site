import React from 'react'
import NewArrivalClient from './NewArrivalClient'
import { prisma } from '../../../../lib/prisma';

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
      reviews: true,
      imageUrl: true,
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
  console.log("Products fetched for New Arrival:", products);

  // Map reviews to their count to match Product[] type
  const mappedProducts = products.map((product) => ({
    ...product,
    reviews: product.reviews.length,
  }));

  return (
    <NewArrivalClient products={mappedProducts} />
  )
}

export default NewArrival