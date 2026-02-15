// lib/category.actions.ts
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function addCategory(data: {
  name: string;
  description?: string;
}) {
  try {
    await prisma.category.create({
      data: {
        name: data.name,
        slug: data.description || '',
      },
    });
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to add category");
  }
}

export async function updateCategory(categoryId: string, data: {
  name: string;
  description?: string;
}) {
  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug: data.description || '',
      },
    });
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update category");
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId }
    });
    
    if (productCount > 0) {
      throw new Error("Cannot delete category with existing products");
    }
    
    await prisma.category.delete({
      where: { id: categoryId }
    });
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete category");
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return categories;
  } catch (error) {
    throw new Error("Failed to fetch categories");
  }
}
