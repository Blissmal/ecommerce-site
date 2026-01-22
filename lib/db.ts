// lib/db.ts
import { prisma } from "./prisma";

/**
 * Get user's cart items with product and variant details
 */
export async function getUserCartItems(userId: string) {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          discount: true,
          discountExpiry: true,
          imageUrl: true,
          stock: true,
          brand: true,
          model: true,
        },
      },
      variant: {
        select: {
          id: true,
          sku: true,
          price: true,
          stock: true,
          color: true,
          size: true,
          storage: true,
        },
      },
    },
  });
}

/**
 * Clear user's entire cart
 */
export async function clearUserCart(userId: string) {
  return await prisma.cartItem.deleteMany({
    where: { userId },
  });
}

/**
 * Get order by checkout request ID
 */
export async function getOrderByCheckoutId(checkoutRequestId: string) {
  return await prisma.order.findUnique({
    where: { checkoutRequestId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
            },
          },
          variant: {
            select: {
              id: true,
              sku: true,
              color: true,
              size: true,
              storage: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  checkoutRequestId: string, 
  status: 'PAID' | 'FAILED', 
  receiptNumber: string | null = null
) {
  const updateData: any = {
    status,
  };

  if (status === 'PAID' && receiptNumber) {
    updateData.receipt = receiptNumber;
    updateData.paymentCompletedAt = new Date();
  }

  return await prisma.order.update({
    where: { checkoutRequestId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}