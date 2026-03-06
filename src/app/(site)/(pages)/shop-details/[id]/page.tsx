import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ShopDetailsClient from "@/components/ShopDetails";

// Type for params
type Params = Promise<{ id: string }>;

// Generate metadata for SEO
export async function generateMetadata(props: {
  params: Params
}): Promise<Metadata> {
  const params = await props.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        title: true,
        description: true,
        imageUrl: true,
      },
    });

    if (!product) {
      return {
        title: "Product Not Found",
      };
    }

    return {
      title: `${product.title} | NextCommerce`,
      description: product.description,
      openGraph: {
        title: product.title,
        description: product.description,
        images: [product.imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | NextCommerce",
    };
  }
}

// Main page component
export default async function ShopDetailsPage(props: { params: Params }) {
  const params = await props.params;

  try {
    // Fetch product from database using ORIGINAL schema
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        description: true,
        shortDescription: true,
        price: true,
        discount: true,
        discountExpiry: true,
        stock: true,
        imageUrl: true,
        images: true,
        brand: true,
        model: true,
        features: true,
        specifications: true,
        availableColors: true,
        availableSizes: true,
        availableStorage: true,
        variants: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    // If product not found, show 404
    if (!product) {
      notFound();
    }

    const now = new Date();
    const isExpired = product.discountExpiry && new Date(product.discountExpiry) < now;

    const serializedProduct = {
      ...product,
      discount: isExpired ? 0 : product.discount, // Set to 0 if already passed
      discountExpiry: product.discountExpiry ? product.discountExpiry.toISOString() : null,
      images: product.images || [],
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      variants: product.variants || [],
      availableColors: product.availableColors || [],
      availableSizes: product.availableSizes || [],
      availableStorage: product.availableStorage || [],
      reviews: product.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: {
          name: review.user.name,
          email: review.user.email,
        },
      })),
    };

    return (
      <main>
        <ShopDetailsClient product={serializedProduct} />
      </main>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}

// Generate static params for static generation (optional but recommended)
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
      take: 100, // Limit to prevent too many static pages
    });

    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}