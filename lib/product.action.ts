// lib/product.actions.ts (enhanced)
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function addProduct(data: {
  title: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
}) {
  try {
    await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
      },
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to add product");
  }
}

export async function updateProduct(productId: string, data: {
  title: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
}) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
      },
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update product");
  }
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId }
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete product");
  }
}

export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (error) {
    throw new Error("Failed to fetch products");
  }
}

export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true
      }
    });
    return product;
  } catch (error) {
    throw new Error("Failed to fetch product");
  }
}

export async function getProductsByCategory(categoryId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (error) {
    throw new Error("Failed to fetch products by category");
  }
}

export async function updateProductStock(productId: string, quantity: number) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update product stock");
  }
}

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
          }
        ]
      },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (error) {
    throw new Error("Failed to search products");
  }
}
