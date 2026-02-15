// lib/product.action.ts
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

// ==================== PRODUCT ACTIONS ====================

/**
 * Create a product with variants
 */
export async function addProduct(data: {
  // Basic product info
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  
  // Product details
  brand?: string;
  model?: string;
  sku?: string;
  
  // Images
  imageUrl: string;
  images?: string[];
  
  // Product-level attributes
  features?: string[];
  specifications?: any;
  tags?: string[];
  weight?: number;
  dimensions?: string;
  
  // Available options
  availableColors?: string[];
  availableSizes?: string[];
  availableStorage?: string[];
  
  // Variants data
  variants: Array<{
    sku: string;
    price: number;
    stock: number;
    color?: string;
    size?: string;
    storage?: string;
    images?: string[];
    weight?: number;
    isDefault?: boolean;
  }>;
  
  // Calculated from variants
  discount?: number; // Applied to all variants
  discountExpiry?: Date | null;
}) {
  try {
    // Calculate base price and total stock from variants
    const basePrice = Math.min(...data.variants.map(v => v.price));
    const totalStock = data.variants.reduce((sum, v) => sum + v.stock, 0);
    
    // Create product with variants in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription,
          price: basePrice, // Lowest variant price
          stock: totalStock, // Sum of all variant stocks
          imageUrl: data.imageUrl,
          images: data.images || [],
          discount: data.discount || null,
          discountExpiry: data.discountExpiry || null,
          categoryId: data.categoryId,
          
          // Product details
          brand: data.brand,
          model: data.model,
          sku: data.sku,
          
          // Physical properties
          weight: data.weight,
          dimensions: data.dimensions,
          tags: data.tags || [],
          
          // Specifications
          specifications: data.specifications || null,
          features: data.features || [],
          
          // Available options
          availableColors: data.availableColors || [],
          availableSizes: data.availableSizes || [],
          availableStorage: data.availableStorage || [],
        },
      });
      
      // Create all variants
      await tx.productVariant.createMany({
        data: data.variants.map(variant => ({
          productId: newProduct.id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          color: variant.color,
          size: variant.size,
          storage: variant.storage,
          images: variant.images || [],
          weight: variant.weight,
          isDefault: variant.isDefault || false,
        })),
      });
      
      return newProduct;
    });
    
    revalidatePath('/'); 
    revalidatePath('/admin/products');
    revalidatePath('/shop-with-sidebar');
    return { success: true, productId: product.id };
  } catch (error) {
    console.error("Failed to add product:", error);
    throw new Error("Failed to add product");
  }
}

/**
 * Update product and its variants
 */
export async function updateProduct(productId: string, data: {
  // Basic product info
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  
  // Product details
  brand?: string;
  model?: string;
  sku?: string;
  
  // Images
  imageUrl: string;
  images?: string[];
  
  // Product-level attributes
  features?: string[];
  specifications?: any;
  tags?: string[];
  weight?: number;
  dimensions?: string;
  
  // Available options
  availableColors?: string[];
  availableSizes?: string[];
  availableStorage?: string[];
  
  // Discount
  discount?: number;
  discountExpiry?: Date | null;
}) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        imageUrl: data.imageUrl,
        images: data.images || [],
        discount: data.discount ?? null,
        discountExpiry: data.discountExpiry ?? null,
        categoryId: data.categoryId,
        
        // Product details
        brand: data.brand,
        model: data.model,
        sku: data.sku,
        
        // Physical properties
        weight: data.weight,
        dimensions: data.dimensions,
        tags: data.tags || [],
        
        // Specifications
        specifications: data.specifications || null,
        features: data.features || [],
        
        // Available options
        availableColors: data.availableColors || [],
        availableSizes: data.availableSizes || [],
        availableStorage: data.availableStorage || [],
      },
    });
    
    revalidatePath('/');                     // Refresh Homepage (New Arrivals)
    revalidatePath('/cart');                 // Prevent price mismatch in cart
    revalidatePath('/admin/products');
    revalidatePath('/shop-with-sidebar');
    revalidatePath(`/shop-details/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    throw new Error("Failed to update product");
  }
}

/**
 * Delete product (cascades to variants, cart items, etc.)
 */
export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId }
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/shop-with-sidebar');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw new Error("Failed to delete product");
  }
}

/**
 * Get all products with their default variant
 */
export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          where: { isDefault: true },
          take: 1,
        },
        _count: {
          select: {
            variants: true,
            orderItems: true,
            reviews: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Get product by ID with all variants
 */
export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          orderBy: [
            { isDefault: 'desc' }, // Default variant first
            { price: 'asc' }       // Then by price
          ]
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            variants: true,
            reviews: true,
          }
        }
      }
    });
    
    return product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw new Error("Failed to fetch product");
  }
}

/**
 * Get products by category with default variants
 */
export async function getProductsByCategory(categoryId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { 
        categoryId,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        variants: {
          where: { isDefault: true },
          take: 1,
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return products;
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    throw new Error("Failed to fetch products by category");
  }
}

/**
 * Search products (includes variant data)
 */
export async function searchProducts(query: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            brand: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              has: query
            }
          }
        ],
        status: 'ACTIVE'
      },
      include: {
        category: true,
        variants: {
          where: { isDefault: true },
          take: 1,
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return products;
  } catch (error) {
    console.error("Failed to search products:", error);
    throw new Error("Failed to search products");
  }
}

/**
 * Update product stock (recalculates from variants)
 */
export async function recalculateProductStock(productId: string) {
  try {
    // Get sum of all variant stocks
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { stock: true }
    });
    
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    
    await prisma.product.update({
      where: { id: productId },
      data: { stock: totalStock }
    });
    
    revalidatePath('/admin/products');
    return { success: true, totalStock };
  } catch (error) {
    console.error("Failed to recalculate stock:", error);
    throw new Error("Failed to recalculate stock");
  }
}

/**
 * Update product base price (recalculates from variants)
 */
export async function recalculateProductPrice(productId: string) {
  try {
    // Get minimum variant price
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { price: true }
    });
    
    const basePrice = Math.min(...variants.map(v => v.price));
    
    await prisma.product.update({
      where: { id: productId },
      data: { price: basePrice }
    });
    
    revalidatePath('/admin/products');
    return { success: true, basePrice };
  } catch (error) {
    console.error("Failed to recalculate price:", error);
    throw new Error("Failed to recalculate price");
  }
}

// ==================== REVIEW ACTIONS ====================

/**
 * Submit a product review
 */
export async function submitReview(data: {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  const dbUID = await prisma.user.findUnique({
    where: { authId: data.userId },
    select: { id: true }
  });

  if (!dbUID) {
    throw new Error("User not found");
  }

  data.userId = dbUID.id;
  try {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Validate comment
    if (!data.comment.trim()) {
      throw new Error("Review comment is required");
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: data.userId,
        productId: data.productId,
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: data.rating,
          comment: data.comment.trim(),
        },
      });

      revalidatePath(`/shop-details/${data.productId}`);
      revalidatePath('/shop-with-sidebar');
      
      return { 
        success: true, 
        reviewId: updatedReview.id,
        message: "Review updated successfully" 
      };
    } else {
      // Create new review
      const newReview = await prisma.review.create({
        data: {
          userId: data.userId,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment.trim(),
        },
      });

      revalidatePath(`/shop-details/${data.productId}`);
      revalidatePath('/shop-with-sidebar');
      
      return { 
        success: true, 
        reviewId: newReview.id,
        message: "Review submitted successfully" 
      };
    }
  } catch (error) {
    console.error("Failed to submit review:", error);
    throw error;
  }
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(productId: string, limit = 10) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return reviews;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    throw new Error("Failed to fetch reviews");
  }
}

/**
 * Delete a review (user can delete their own review)
 */
export async function deleteReview(reviewId: string, userId: string) {
  try {
    // Check if the review belongs to the user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/shop-details/${review.productId}`);
    
    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    console.error("Failed to delete review:", error);
    throw error;
  }
}