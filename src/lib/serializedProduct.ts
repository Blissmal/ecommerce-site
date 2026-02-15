// src/lib/serializeProduct.ts

/**
 * Serializes a product object to remove non-serializable fields (like Date objects)
 * This is necessary for Redux which requires all state to be serializable
 */

export type SerializableProduct = {
  id: string;
  title: string;
  price: number;
  discount: number | null;
  reviews: number;
  imageUrl: string;
  images?: string[];
  description: string;
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export function serializeProduct(product: any): SerializableProduct {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    discount: product.discount,
    reviews: typeof product.reviews === 'number' ? product.reviews : product.reviews?.length || 0,
    imageUrl: product.imageUrl,
    images: product.images || [],
    description: product.description,
    stock: product.stock,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
  };
}

/**
 * Serializes an array of products
 */
export function serializeProducts(products: any[]): SerializableProduct[] {
  return products.map(serializeProduct);
}

/**
 * Prisma select object for safe product queries
 * Use this in your Prisma queries to avoid fetching non-serializable fields
 */
export const SAFE_PRODUCT_SELECT = {
  id: true,
  title: true,
  price: true,
  discount: true,
  reviews: true,
  imageUrl: true,
  images: true,
  description: true,
  stock: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  // Deliberately exclude: createdAt, updatedAt, and any other Date fields
} as const;