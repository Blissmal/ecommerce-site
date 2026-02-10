// lib/order.action.ts
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { updateVariantStock } from "./variant.action";

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
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const updateData: any = { status };

    // Set payment completion time if status is PAID
    if (status === "PAID") {
      updateData.paymentCompletedAt = new Date();
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/my-account");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw new Error("Failed to update order status");
  }
}

/**
 * Cancel an order and restore variant stock
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

      console.log(`Restoring stock for order ${orderId} (status: ${order.status})`);

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

      console.log(`✅ Stock restored for order ${orderId}`);
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
 * Sets order status to CANCELLED
 */
export async function cancelOrder(orderId: string) {
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

      // Don't allow cancelling already completed orders
      if (["PAID", "SHIPPED", "DELIVERED"].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      // If already cancelled, skip (idempotent)
      if (order.status === "CANCELLED") {
        console.log(`Order ${orderId} is already cancelled, skipping...`);
        return;
      }

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

      // Update order status to CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      console.log(`✅ Order ${orderId} cancelled and stock restored`);
    });

    revalidatePath("/admin/orders");
    revalidatePath("/my-account");
    revalidatePath("/cart");
    revalidatePath("/checkout");
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
    console.error("Failed to cancel order:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to cancel order");
  }
}

/**
 * Get all orders (Admin)
 */
export async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany({
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
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

/**
 * Get orders by user
 */
export async function getOrdersByUser(userId: string) {
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
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    throw new Error("Failed to fetch user orders");
  }
}

/**
 * Get single order by ID
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
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                color: true,
                size: true,
                storage: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    throw new Error("Failed to fetch order");
  }
}

/**
 * Get order statistics (Admin dashboard)
 */
export async function getOrderStatistics() {
  try {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.aggregate({
        where: {
          status: {
            in: ["PAID", "SHIPPED", "DELIVERED"],
          },
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  } catch (error) {
    console.error("Failed to fetch order statistics:", error);
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

export async function batchUpdateOrderStatus(orderIds: string[], status: OrderStatus) {
  try {
    // Update all orders in a single transaction
    await prisma.$transaction(
      orderIds.map(orderId =>
        prisma.order.update({
          where: { id: orderId },
          data: { 
            status, //////////
          }
        })
      )
    );
    
    revalidatePath('/admin/orders');
    return { success: true, count: orderIds.length };
  } catch (error) {
    console.error('Error in batch update:', error);
    throw new Error(`Failed to update orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

// Get order statistics for dashboard
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

// Validate orders before batch operations
export async function validateOrdersForBatchUpdate(orderIds: string[], targetStatus: OrderStatus) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: orderIds
        }
      },
      select: {
        id: true,
        status: true
      }
    });

    const invalidTransitions: { orderId: string; currentStatus: string; reason: string }[] = [];

    orders.forEach(order => {
      // Define valid transitions
      const validTransitions: Record<string, OrderStatus[]> = {
        'PENDING': ['PROCESSING', 'CANCELLED', 'FAILED'],
        'PAID': ['PROCESSING', 'CANCELLED'],
        'PROCESSING': ['SHIPPED', 'CANCELLED'],
        'SHIPPED': ['DELIVERED', 'CANCELLED'],
        'DELIVERED': [], // Final state
        'CANCELLED': [], // Final state
        'FAILED': ['PENDING'], // Can retry
      };

      const allowedStatuses = validTransitions[order.status] || [];
      
      if (!allowedStatuses.includes(targetStatus)) {
        invalidTransitions.push({
          orderId: order.id,
          currentStatus: order.status,
          reason: `Cannot transition from ${order.status} to ${targetStatus}`
        });
      }
    });

    return {
      valid: invalidTransitions.length === 0,
      invalidTransitions,
      validCount: orders.length - invalidTransitions.length
    };
  } catch (error) {
    console.error('Error validating batch update:', error);
    throw error;
  }
}

// Archive old orders (move to archive table or soft delete)
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