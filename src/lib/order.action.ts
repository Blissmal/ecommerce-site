// lib/order.action.ts
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { updateVariantStock } from "./variant.action";
import { canTransitionStatus } from "./utils/order-utils";
import { sendOrderStatusMessage } from "./auto-message-service";

// Type definitions
export type OrderStatus = 
  | "PENDING" 
  | "PROCESSING" 
  | "PAID" 
  | "FAILED" 
  | "CANCELLED" 
  | "SHIPPED" 
  | "DELIVERED";

export type PaymentMethod = "MPESA" | "BANK";

interface CreateOrderItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number; // Price at time of purchase
}

interface CreateOrderData {
  userId: string;
  items: CreateOrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  billingName?: string;
  billingEmail?: string;
  billingAddress?: string;
  orderNotes?: string;
}

/**
 * Create a new order with variant tracking
 */
export async function createOrder(data: CreateOrderData) {
  try {
    // Validate all items have enough stock
    for (const item of data.items) {
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, sku: true }
        });

        if (!variant) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.sku}`);
        }
      }
    }

    // Create order with variant snapshots
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          total: data.totalAmount,
          status: "PENDING",
          paymentMethod: data.paymentMethod,
          phoneNumber: data.phoneNumber,
          checkoutRequestId: data.checkoutRequestId,
          merchantRequestId: data.merchantRequestId,
          billingName: data.billingName,
          billingEmail: data.billingEmail,
          billingAddress: data.billingAddress,
          orderNotes: data.orderNotes,
          paymentInitiatedAt: data.checkoutRequestId ? new Date() : null,
          orderItems: {
            create: await Promise.all(
              data.items.map(async (item) => {
                // Get variant snapshot if variantId exists
                let variantSnapshot = null;
                if (item.variantId) {
                  const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                    select: {
                      sku: true,
                      color: true,
                      size: true,
                      storage: true,
                      price: true,
                    },
                  });

                  if (variant) {
                    variantSnapshot = {
                      sku: variant.sku,
                      color: variant.color,
                      size: variant.size,
                      storage: variant.storage,
                      originalPrice: variant.price,
                    };
                  }
                }

                return {
                  productId: item.productId,
                  variantId: item.variantId || null,
                  quantity: item.quantity,
                  price: item.price,
                  variantSnapshot: variantSnapshot || undefined,
                };
              })
            ),
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  brand: true,
                  model: true,
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

      // Update variant stocks
      for (const item of data.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          // Recalculate product total stock
          const variants = await tx.productVariant.findMany({
            where: { productId: item.productId },
            select: { stock: true },
          });

          const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: totalStock },
          });
        }
      }

      return newOrder;
    });

    revalidatePath("/admin/orders");
    revalidatePath("/my-account");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/");
    revalidatePath('/shop-with-sidebar');
    for (const item of data.items) {
      revalidatePath(`/shop-details/${item.productId}`);
    }
    return { success: true, orderId: order.id, order };
  } catch (error) {
    console.error("Failed to create order:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create order");
  }
}

/**
 * Update order status with validation and auto-messaging
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    // Get current order status
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    const oldStatus = currentOrder.status as OrderStatus;

    // Validate status transition
    const transition = canTransitionStatus(oldStatus, status);
    
    if (!transition.canTransition) {
      throw new Error(transition.reason || "Invalid status transition");
    }

    const updateData: any = { status };

    // Set payment completion time if status is PAID
    if (status === "PAID") {
      updateData.paymentCompletedAt = new Date();
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Send auto-message for status change
    try {
      await sendOrderStatusMessage(orderId, status, oldStatus);
    } catch (messageError) {
      // Log but don't fail the order update if messaging fails
      console.error("Failed to send status message:", messageError);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/my-account");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update order status");
  }
}

/**
 * Restore order stock (used when cancelling orders)
 */
export async function restoreOrderStock(orderId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Get order with items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // console.log(`Restoring stock for order ${orderId} (status: ${order.status})`);

      // Restore variant stocks
      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });

          // Recalculate product total stock
          const variants = await tx.productVariant.findMany({
            where: { productId: item.productId },
            select: { stock: true },
          });

          const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: totalStock },
          });
        } else {
          // If no variant, restore product stock directly
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // console.log(`Stock restored for order ${orderId}`);
    });

    // Revalidate pages
    revalidatePath("/admin/orders");
    revalidatePath("/my-account");
    revalidatePath("/");
    revalidatePath("/shop-with-sidebar");
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (order) {
      for (const item of order.orderItems) {
        revalidatePath(`/shop-details/${item.productId}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to restore order stock:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to restore order stock");
  }
}

/**
 * Cancel an order and restore variant stock
 * Sets order status to CANCELLED with validation
 */
export async function cancelOrder(orderId: string) {
  try {
    // Get current order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const oldStatus = order.status as OrderStatus;

    // Validate that we can cancel this order
    const transition = canTransitionStatus(oldStatus, "CANCELLED");
    
    if (!transition.canTransition) {
      throw new Error(transition.reason || "Cannot cancel this order");
    }

    // Restore stock and update status
    await restoreOrderStock(orderId);
    
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // Send cancellation message
    try {
      await sendOrderStatusMessage(orderId, "CANCELLED", oldStatus);
    } catch (messageError) {
      console.error("Failed to send cancellation message:", messageError);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/my-account");
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to cancel order");
  }
}

/**
 * Batch update order status with validation and auto-messaging
 */
export async function batchUpdateOrderStatus(orderIds: string[], targetStatus: OrderStatus) {
  try {
    // First, get all orders and validate transitions
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true, status: true }
    });

    // Separate valid and invalid orders
    const validOrders: Array<{ id: string; oldStatus: OrderStatus }> = [];
    const invalidOrders: Array<{ id: string; currentStatus: OrderStatus; reason: string }> = [];

    for (const order of orders) {
      const transition = canTransitionStatus(order.status as OrderStatus, targetStatus);
      
      if (transition.canTransition) {
        validOrders.push({
          id: order.id,
          oldStatus: order.status as OrderStatus
        });
      } else {
        invalidOrders.push({
          id: order.id,
          currentStatus: order.status as OrderStatus,
          reason: transition.reason || "Invalid transition"
        });
      }
    }

    // Update only valid orders
    let updatedCount = 0;
    if (validOrders.length > 0) {
      const updateData: any = { status: targetStatus };

      // Set payment completion time if status is PAID
      if (targetStatus === "PAID") {
        updateData.paymentCompletedAt = new Date();
      }

      await prisma.$transaction(
        validOrders.map(order =>
          prisma.order.update({
            where: { id: order.id },
            data: updateData
          })
        )
      );
      
      updatedCount = validOrders.length;

      // Send auto-messages for all updated orders
      // Run in background to avoid blocking
      Promise.all(
        validOrders.map(order =>
          sendOrderStatusMessage(order.id, targetStatus, order.oldStatus)
            .catch(err => console.error(`Failed to send message for order ${order.id}:`, err))
        )
      ).catch(err => console.error("Error sending batch messages:", err));
    }

    revalidatePath('/admin/orders');
    revalidatePath('/my-account');
    
    return { 
      success: true, 
      updatedCount,
      skippedCount: invalidOrders.length,
      invalidOrders: invalidOrders.length > 0 ? invalidOrders : undefined
    };
  } catch (error) {
    console.error('Error in batch update:', error);
    throw new Error(`Failed to update orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate orders for batch update (pre-check before actual update)
 */
export async function validateOrdersForBatchUpdate(orderIds: string[], targetStatus: OrderStatus) {
  try {
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true, status: true }
    });

    const validOrders: string[] = [];
    const invalidTransitions: Array<{ 
      orderId: string; 
      currentStatus: OrderStatus; 
      reason: string 
    }> = [];

    for (const order of orders) {
      const transition = canTransitionStatus(order.status as OrderStatus, targetStatus);
      
      if (transition.canTransition) {
        validOrders.push(order.id);
      } else {
        invalidTransitions.push({
          orderId: order.id,
          currentStatus: order.status as OrderStatus,
          reason: transition.reason || "Invalid transition"
        });
      }
    }

    return {
      valid: invalidTransitions.length === 0,
      validCount: validOrders.length,
      invalidCount: invalidTransitions.length,
      invalidTransitions,
      summary: {
        total: orders.length,
        canUpdate: validOrders.length,
        cannotUpdate: invalidTransitions.length
      }
    };
  } catch (error) {
    console.error('Error validating batch update:', error);
    throw error;
  }
}

// Batch delete orders (optional - for admin cleanup)
export async function batchDeleteOrders(orderIds: string[]) {
  try {
    // First delete all order items
    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: orderIds
        }
      }
    });
    
    // Then delete the orders
    await prisma.order.deleteMany({
      where: {
        id: {
          in: orderIds
        }
      }
    });
    
    revalidatePath('/admin/orders');
    return { success: true, count: orderIds.length };
  } catch (error) {
    console.error('Error in batch delete:', error);
    throw new Error(`Failed to delete orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                brand: true,
                model: true,
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

    return order;
  } catch (error) {
    console.error("Failed to get order:", error);
    throw new Error("Failed to get order");
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                price: true,
              },
            },
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  } catch (error) {
    console.error("Failed to get user orders:", error);
    throw new Error("Failed to get user orders");
  }
}

/**
 * Get order statistics
 */
export async function getOrderStatistics() {
  try {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "DELIVERED" },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  } catch (error) {
    console.error("Failed to get order statistics:", error);
    throw new Error("Failed to fetch order statistics");
  }
}

/**
 * Search orders
 */
export async function searchOrders(query: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            id: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            user: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            user: {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            billingEmail: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
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
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  } catch (error) {
    console.error("Failed to search orders:", error);
    throw new Error("Failed to search orders");
  }
}

/**
 * Update M-Pesa payment details
 */
export async function updateMpesaPayment(data: {
  orderId: string;
  checkoutRequestId: string;
  merchantRequestId: string;
}) {
  try {
    await prisma.order.update({
      where: { id: data.orderId },
      data: {
        checkoutRequestId: data.checkoutRequestId,
        merchantRequestId: data.merchantRequestId,
        paymentInitiatedAt: new Date(),
      },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to update M-Pesa payment:", error);
    throw new Error("Failed to update M-Pesa payment");
  }
}

/**
 * Get order analytics for dashboard
 */
export async function getOrderAnalytics(startDate?: Date, endDate?: Date) {
  try {
    const whereClause = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    } : {};

    const [
      totalOrders,
      totalRevenue,
      statusBreakdown,
      recentOrders,
      topCustomers
    ] = await Promise.all([
      // Total orders count
      prisma.order.count({ where: whereClause }),
      
      // Total revenue (only delivered orders)
      prisma.order.aggregate({
        where: {
          ...whereClause,
          status: 'DELIVERED'
        },
        _sum: {
          total: true
        }
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: whereClause,
        _count: {
          status: true
        }
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: whereClause,
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      
      // Top customers by order count
      prisma.order.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: {
          userId: true
        },
        _sum: {
          total: true
        },
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 10
      })
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      statusBreakdown,
      recentOrders,
      topCustomers
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

/**
 * Archive old orders (move to archive table or soft delete)
 */
export async function archiveOldOrders(daysOld: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.order.updateMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        status: {
          in: ['DELIVERED', 'CANCELLED']
        }
      },
      data: {
        // Add an 'archived' field to your schema, or handle differently
        // archived: true
      }
    });

    revalidatePath('/admin/orders');
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error archiving orders:', error);
    throw error;
  }
}