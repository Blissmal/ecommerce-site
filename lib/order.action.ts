// lib/order.actions.ts
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { updateProductStock } from "./product.action";

export async function createOrder(data: {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}) {
  try {
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        total: data.totalAmount,
        status: 'PENDING',
        createdAt: new Date(),
        paymentMethod: 'MPESA',
        orderItems: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Update product stock
    for (const item of data.items) {
      await updateProductStock(item.productId, item.quantity);
    }

    revalidatePath('/admin/orders');
    return { success: true, orderId: order.id };
  } catch (error) {
    throw new Error("Failed to create order");
  }
}

import type { OrderStatus } from "../src/generated/prisma"; // adjust the import path as needed

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update order status");
  }
}

export async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return orders;
  } catch (error) {
    throw new Error("Failed to fetch orders");
  }
}

export async function getOrdersByUser(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return orders;
  } catch (error) {
    throw new Error("Failed to fetch user orders");
  }
}
