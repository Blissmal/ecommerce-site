// lib/variant.action.ts
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { generateVariantSKU } from "./utils/variant-utils";

// ==================== VARIANT ACTIONS ====================

/**
 * Add a new variant to an existing product
 */
export async function addVariant(data: {
  productId: string;
  sku: string;
  price: number;
  stock: number;
  color?: string;
  size?: string;
  storage?: string;
  images?: string[];
  weight?: number;
  isDefault?: boolean;
}) {
  try {
    // If this is set as default, unset other defaults first
    if (data.isDefault) {
      await prisma.productVariant.updateMany({
        where: { 
          productId: data.productId,
          isDefault: true 
        },
        data: { isDefault: false }
      });
    }
    
    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        color: data.color,
        size: data.size,
        storage: data.storage,
        images: data.images || [],
        weight: data.weight,
        isDefault: data.isDefault || false,
      },
    });
    
    // Recalculate product totals
    await recalculateProductTotals(data.productId);
    
    revalidatePath('/admin/products');
    revalidatePath(`/shop-details/${data.productId}`);
    return { success: true, variantId: variant.id };
  } catch (error) {
    console.error("Failed to add variant:", error);
    throw new Error("Failed to add variant");
  }
}

/**
 * Update an existing variant
 */
export async function updateVariant(variantId: string, data: {
  sku?: string;
  price?: number;
  stock?: number;
  color?: string;
  size?: string;
  storage?: string;
  images?: string[];
  weight?: number;
  isDefault?: boolean;
}) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true }
    });
    
    if (!variant) {
      throw new Error("Variant not found");
    }
    
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.productVariant.updateMany({
        where: { 
          productId: variant.productId,
          isDefault: true,
          id: { not: variantId }
        },
        data: { isDefault: false }
      });
    }
    
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        color: data.color,
        size: data.size,
        storage: data.storage,
        images: data.images,
        weight: data.weight,
        isDefault: data.isDefault,
      },
    });
    
    // Recalculate product totals
    await recalculateProductTotals(variant.productId);
    
    revalidatePath('/admin/products');
    revalidatePath(`/shop-details/${variant.productId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update variant:", error);
    throw new Error("Failed to update variant");
  }
}

/**
 * Delete a variant
 */
export async function deleteVariant(variantId: string) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true }
    });
    
    if (!variant) {
      throw new Error("Variant not found");
    }
    
    // Check if this is the last variant
    const variantCount = await prisma.productVariant.count({
      where: { productId: variant.productId }
    });
    
    if (variantCount <= 1) {
      throw new Error("Cannot delete the last variant. Delete the product instead.");
    }
    
    await prisma.productVariant.delete({
      where: { id: variantId }
    });
    
    // Recalculate product totals
    await recalculateProductTotals(variant.productId);
    
    revalidatePath('/admin/products');
    revalidatePath(`/shop-details/${variant.productId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete variant:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete variant");
  }
}

/**
 * Get all variants for a product
 */
export async function getProductVariants(productId: string) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: [
        { isDefault: 'desc' },
        { price: 'asc' }
      ]
    });
    
    return variants;
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    throw new Error("Failed to fetch variants");
  }
}

/**
 * Get variant by ID
 */
export async function getVariantById(variantId: string) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    
    return variant;
  } catch (error) {
    console.error("Failed to fetch variant:", error);
    throw new Error("Failed to fetch variant");
  }
}

/**
 * Find specific variant by product and options
 */
export async function findVariant(params: {
  productId: string;
  color?: string;
  size?: string;
  storage?: string;
}) {
  try {
    const variant = await prisma.productVariant.findFirst({
      where: {
        productId: params.productId,
        color: params.color || null,
        size: params.size || null,
        storage: params.storage || null,
      }
    });
    
    return variant;
  } catch (error) {
    console.error("Failed to find variant:", error);
    throw new Error("Failed to find variant");
  }
}

/**
 * Update variant stock
 */
export async function updateVariantStock(variantId: string, quantity: number, operation: 'increment' | 'decrement' = 'decrement') {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true }
    });
    
    if (!variant) {
      throw new Error("Variant not found");
    }
    
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: {
          [operation]: quantity
        }
      }
    });
    
    // Recalculate product total stock
    await recalculateProductTotals(variant.productId);
    
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error("Failed to update variant stock:", error);
    throw new Error("Failed to update variant stock");
  }
}

/**
 * Set default variant
 */
export async function setDefaultVariant(variantId: string) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true }
    });
    
    if (!variant) {
      throw new Error("Variant not found");
    }
    
    // Unset all other defaults
    await prisma.productVariant.updateMany({
      where: { 
        productId: variant.productId,
        isDefault: true 
      },
      data: { isDefault: false }
    });
    
    // Set this one as default
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { isDefault: true }
    });
    
    revalidatePath('/admin/products');
    revalidatePath(`/shop-details/${variant.productId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to set default variant:", error);
    throw new Error("Failed to set default variant");
  }
}

/**
 * Bulk update variant prices (e.g., apply discount)
 */
export async function bulkUpdateVariantPrices(productId: string, discountPercentage: number) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { id: true, price: true }
    });
    
    // Update each variant
    await Promise.all(
      variants.map(variant => 
        prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            price: variant.price * (1 - discountPercentage / 100)
          }
        })
      )
    );
    
    // Recalculate product base price
    await recalculateProductTotals(productId);
    
    revalidatePath('/admin/products');
    revalidatePath(`/shop-details/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk update prices:", error);
    throw new Error("Failed to bulk update prices");
  }
}

/**
 * Get variant stock levels (for low stock alerts)
 */
export async function getLowStockVariants(threshold: number = 5) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        stock: {
          lte: threshold
        }
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          }
        }
      },
      orderBy: {
        stock: 'asc'
      }
    });
    
    return variants;
  } catch (error) {
    console.error("Failed to fetch low stock variants:", error);
    throw new Error("Failed to fetch low stock variants");
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Recalculate product totals from variants
 */
async function recalculateProductTotals(productId: string) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { price: true, stock: true }
    });
    
    if (variants.length === 0) {
      return;
    }
    
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const basePrice = Math.min(...variants.map(v => v.price));
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: totalStock,
        price: basePrice
      }
    });
  } catch (error) {
    console.error("Failed to recalculate product totals:", error);
  }
}

// generateVariantSKU moved to lib/utils/variant-utils.ts

// Utility functions like generateVariantSKU have been moved to lib/utils/variant-utils.ts
// Import them directly from there in your components