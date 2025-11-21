// lib/user.actions.ts
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update user role");
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete user");
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    });
    return users;
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user");
  }
}