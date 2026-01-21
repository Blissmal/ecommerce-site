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

  // Map reviews to their count and ensure clean serializable data
  const mappedProducts = products.map((product) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    discount: product.discount,
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
  }));

  return (
    <NewArrivalClient products={mappedProducts} />
  )
}

export default NewArrival