// app/api/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../lib/prisma";

// 🔹 GET — Fetch all orders for the current user (with variants)
export async function GET() {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await prisma.user.findFirst({
      where: {
        authId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get orders with variant details
    const userOrders = await prisma.order.findMany({
      where: {
        userId: userRecord.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform orders to include variant snapshot if variant is deleted
    const transformedOrders = userOrders.map((order) => ({
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        // If variant exists, use live data; otherwise use snapshot
        variantDetails: item.variant || (item.variantSnapshot as any) || null,
      })),
      createdAt: order.createdAt.toISOString(),
      paymentInitiatedAt: order.paymentInitiatedAt?.toISOString(),
      paymentCompletedAt: order.paymentCompletedAt?.toISOString(),
    }));

    console.log("User Orders:", transformedOrders);

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("[ORDER_GET_ERROR]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// 🔹 POST — Create a new order from cart
export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await prisma.user.findFirst({
      where: {
        authId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      paymentMethod,
      phoneNumber,
      billingName,
      billingEmail,
      billingAddress,
      orderNotes,
    } = body;

    // Validate payment method
    if (!paymentMethod || !["MPESA", "BANK"].includes(paymentMethod)) {
      return NextResponse.json(
        { message: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Get cart items with variant details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userRecord.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            discount: true,
            imageUrl: true,
          },
        },
        variant: {
          select: {
            id: true,
            price: true,
            stock: true,
            sku: true,
            color: true,
            size: true,
            storage: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Validate stock availability
    for (const item of cartItems) {
      if (item.variant) {
        if (item.variant.stock < item.quantity) {
          return NextResponse.json(
            {
              message: `Insufficient stock for ${item.variant.sku}. Only ${item.variant.stock} available.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = cartItems.map((item) => {
      const basePrice = item.variant?.price || 0;
      const discount = item.product.discount || 0;
      const finalPrice =
        discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

      totalAmount += finalPrice * item.quantity;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: finalPrice,
      };
    });
    console.log("Total Amount:", totalAmount);

    // Create order using server action
    const { createOrder } = await import("../../../../lib/order.action");
    const result = await createOrder({
      userId: userRecord.id,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod as "MPESA" | "BANK",
      phoneNumber,
      billingName,
      billingEmail,
      billingAddress,
      orderNotes,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: "Failed to create order" },
        { status: 500 }
      );
    }

    // Clear cart after successful order
    await prisma.cartItem.deleteMany({
      where: { userId: userRecord.id },
    });

    // Transform order response
    const transformedOrder = {
      ...result.order,
      orderItems: result.order!.orderItems.map((item) => ({
        ...item,
        variantDetails: item.variant || (item.variantSnapshot as any) || null,
      })),
      createdAt: result.order!.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      order: transformedOrder,
    });
  } catch (error) {
    console.error("[ORDER_POST_ERROR]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// 🔹 PUT — Update order status
export async function PUT(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { message: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "PAID",
      "FAILED",
      "CANCELLED",
      "SHIPPED",
      "DELIVERED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // Update order status
    const { updateOrderStatus } = await import("../../../../lib/order.action");
    await updateOrderStatus(orderId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ORDER_PUT_ERROR]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// 🔹 DELETE — Cancel an order
export async function DELETE(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await prisma.user.findFirst({
      where: {
        authId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userRecord.id) {
      return NextResponse.json(
        { message: "Unauthorized to cancel this order" },
        { status: 403 }
      );
    }

    if (!["PENDING", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        { message: "Can only cancel pending or processing orders" },
        { status: 400 }
      );
    }

    // Cancel order and restore stock
    const { cancelOrder } = await import("../../../../lib/order.action");
    await cancelOrder(orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ORDER_DELETE_ERROR]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}