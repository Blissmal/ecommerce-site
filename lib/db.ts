import { prisma } from "./prisma";

export async function createOrderWithItems(userId: string, orderData: any, items: any[]) {
  try {
    const order = await prisma.order.create({
      data: {
        userId,
        total: orderData.total,
        paymentMethod: 'MPESA',
        status: 'PENDING',
        phoneNumber: orderData.phoneNumber,
        billingName: orderData.billingName,
        billingEmail: orderData.billingEmail,
        billingAddress: orderData.billingAddress,
        orderNotes: orderData.orderNotes,
        orderItems: {
          create: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            // Capture JSON snapshot of the variant at this exact moment
            variantSnapshot: item.variantSnapshot 
          }))
        }
      },
      include: {
        orderItems: true,
        user: true
      }
    });

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderPaymentDetails(orderId: string, paymentData: any) {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      checkoutRequestId: paymentData.checkoutRequestId,
      merchantRequestId: paymentData.merchantRequestId,
      status: 'PENDING', // Keep as pending until STK is successful
      paymentInitiatedAt: new Date()
    }
  });
}

export async function updateOrderPaymentStatus(checkoutRequestId, status, receiptNumber = null) {
  const updateData = {
    status,
    ...(status === 'PAID' && {
      receipt: receiptNumber,
      paymentCompletedAt: new Date()
    })
  };

  return await prisma.order.update({
    where: { checkoutRequestId },
    data: updateData,
    include: {
      user: true,
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });
}

export async function getOrderByCheckoutId(checkoutRequestId) {
  return await prisma.order.findUnique({
    where: { checkoutRequestId },
    include: {
      user: true,
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });
}

export async function clearUserCart(userId) {
  return await prisma.cartItem.deleteMany({
    where: { userId }
  });
}

export async function getUserCartItems(userId: string) {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
      variant: true
    }
  });
}