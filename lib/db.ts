import { prisma } from "./prisma";

export async function createOrderWithItems(userId, orderData, cartItems) {
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
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price || item.product.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderPaymentDetails(orderId, paymentData) {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      checkoutRequestId: paymentData.checkoutRequestId,
      merchantRequestId: paymentData.merchantRequestId,
      status: 'PROCESSING',
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

export async function getUserCartItems(userId) {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true
    }
  });
}