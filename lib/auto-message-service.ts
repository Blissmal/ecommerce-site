import { prisma } from './prisma';

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  PAID: `Great news! We've received your payment successfully. 

Your order is now being processed and we'll notify you once it ships. 

Order details and tracking information will be available in your account.

Thank you for shopping with us!`,

  PROCESSING: `Your order is being prepared for shipment.

Our team is carefully packing your items and they'll be on their way soon.

Expected processing time: 1-2 business days.`,

  SHIPPED: `Your order has been shipped! 📦

Your package is on its way and should arrive within 2-3 business days.

You can track your shipment using the tracking number in your order details.

We'll notify you once it's delivered!`,

  DELIVERED: `Your order has been delivered! 🎉

We hope you love your purchase! 

If you have any questions or concerns about your order, please don't hesitate to reach out.

We'd love to hear your feedback!`,

  CANCELLED: `Your order has been cancelled as requested.

If you cancelled by mistake or have questions, please let us know and we'll be happy to help.

Any payment made will be refunded within 5-7 business days.`,

  FAILED: `We encountered an issue with your payment.

Please check your payment method and try again, or contact us for assistance.

Your order is on hold until payment is confirmed.`,

  PENDING: '', // No auto-message for pending
};

export async function sendOrderStatusMessage(
  orderId: string,
  newStatus: OrderStatus,
  oldStatus?: OrderStatus
) {
  // Only send messages for specific status changes
  if (!STATUS_MESSAGES[newStatus]) {
    return null;
  }

  // Don't send duplicate messages
  if (oldStatus === newStatus) {
    return null;
  }

  try {
    // Get order with user info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        conversations: {
          where: { orderId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return null;
    }

    // Get or create conversation for this order
    let conversation = order.conversations[0];

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          subject: `Order #${order.id.slice(-8).toUpperCase()}`,
          priority: 'NORMAL',
          status: 'ACTIVE',
        },
      });
    }

    // Create system message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: order.userId, // System messages use user ID as sender
        senderType: 'ADMIN',
        messageType: 'SYSTEM',
        content: STATUS_MESSAGES[newStatus],
        isRead: false,
      },
      include: {
        conversation: {
          include: {
            user: {
              select: { email: true, name: true },
            },
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    console.log(`✅ Auto-message sent for order ${orderId} - Status: ${newStatus}`);

    return message;
  } catch (error) {
    console.error('Failed to send order status message:', error);
    return null;
  }
}

// Helper to format order status for display
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: 'Payment Pending',
    PAID: 'Payment Confirmed',
    PROCESSING: 'Being Processed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    FAILED: 'Payment Failed',
  };
  return labels[status] || status;
}