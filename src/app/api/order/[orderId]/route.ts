// app/api/order/[orderId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { stackServerApp } from "@/stack";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Optional: Verify user owns this order
    const user = await stackServerApp.getUser();
    
    // Get order with full variant details
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

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Optional: Check if user is authorized to view this order
    if (user?.id) {
      const userRecord = await prisma.user.findFirst({
        where: { authId: user.id },
        select: { id: true },
      });

      // If logged in user doesn't own the order and is not admin, deny access
      if (userRecord && order.userId !== userRecord.id) {
        // You can add admin role check here if needed
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // Transform order to include variant details (live or snapshot)
    const transformedOrder = {
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        // Use live variant if exists, otherwise use snapshot
        variantDetails: item.variant || (item.variantSnapshot as any) || null,
      })),
      createdAt: order.createdAt.toISOString(),
      paymentInitiatedAt: order.paymentInitiatedAt?.toISOString() || null,
      paymentCompletedAt: order.paymentCompletedAt?.toISOString() || null,
    };

    return NextResponse.json(
      { success: true, order: transformedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}