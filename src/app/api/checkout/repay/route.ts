// app/api/checkout/repay/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { mpesaService } from '../../../../../services/mpesaService';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, phoneNumber } = body;

    // 1. Validation
    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing Order ID' 
      }, { status: 400 });
    }

    // 2. Fetch Existing Order with Items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                stock: true
              }
            },
            variant: {
              select: {
                id: true,
                sku: true,
                stock: true
              }
            }
          }
        }
      }
    });

    console.log('Fetched Order for Repay:', order);

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: 'Order not found' 
      }, { status: 404 });
    }

    // 3. Ensure Order is Eligible for Repayment
    // Allow retrying payment for PENDING, FAILED, or CANCELLED statuses
    if (!['PENDING', 'FAILED', 'CANCELLED'].includes(order.status)) {
      return NextResponse.json({ 
        success: false, 
        message: `Order cannot be paid. Current status: ${order.status}` 
      }, { status: 400 });
    }

    // 4. Validate Stock Availability Before Proceeding
    // This prevents initiating payment if items are no longer available
    for (const item of order.orderItems) {
      if (item.variantId) {
        const currentVariant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, sku: true }
        });

        if (!currentVariant) {
          return NextResponse.json({ 
            success: false, 
            message: `Product variant "${item.variant?.sku || 'Unknown'}" is no longer available` 
          }, { status: 400 });
        }

        if (currentVariant.stock < item.quantity) {
          return NextResponse.json({ 
            success: false, 
            message: `Insufficient stock for "${item.variant?.sku || 'item'}". Only ${currentVariant.stock} available, but ${item.quantity} required.` 
          }, { status: 400 });
        }
      } else {
        // If no variant, check product stock
        const currentProduct = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, title: true }
        });

        if (!currentProduct) {
          return NextResponse.json({ 
            success: false, 
            message: `Product "${item.product?.title || 'Unknown'}" is no longer available` 
          }, { status: 400 });
        }

        if (currentProduct.stock < item.quantity) {
          return NextResponse.json({ 
            success: false, 
            message: `Insufficient stock for "${item.product?.title || 'item'}". Only ${currentProduct.stock} available, but ${item.quantity} required.` 
          }, { status: 400 });
        }
      }
    }

    // 5. Determine Phone Number
    // Use the new phone number provided by the user, or fallback to the one in the order
    const phoneToUse = phoneNumber || order.phoneNumber;

    if (!phoneToUse) {
      return NextResponse.json({ 
        success: false, 
        message: 'No phone number provided' 
      }, { status: 400 });
    }

    // 6. Format Phone for M-Pesa (254...)
    let formattedPhone = phoneToUse.replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.slice(1)}`;
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = `254${formattedPhone}`;
    }

    // 7. Initiate M-Pesa STK Push
    const mpesaResult = await mpesaService.initiateSTKPush(
      formattedPhone,
      Math.ceil(order.total),
      `ORD-${order.id.slice(-8)}`, // Reference the existing Order ID
      `Retry Payment for Order ${order.id.slice(-8)}`
    );

    // console.log('M-Pesa Repay Result:', mpesaResult);

    if (mpesaResult.ResponseCode !== '0') {
      return NextResponse.json({ 
        success: false, 
        message: mpesaResult.CustomerMessage || 'M-Pesa initiation failed. Please try again.' 
      }, { status: 400 });
    }

    // 8. Update Order and Reduce Stock in a Transaction
    await prisma.$transaction(async (tx) => {
      // Update order with new payment details
      await tx.order.update({
        where: { id: order.id },
        data: {
          checkoutRequestId: mpesaResult.CheckoutRequestID,
          merchantRequestId: mpesaResult.MerchantRequestID,
          phoneNumber: formattedPhone, // Update phone in case they used a new one
          status: 'PENDING', // Reset status to PENDING
          paymentInitiatedAt: new Date()
        }
      });

      // Reduce stock for each order item
      for (const item of order.orderItems) {
        if (item.variantId) {
          // Reduce variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });

          // Recalculate product total stock from all variants
          const variants = await tx.productVariant.findMany({
            where: { productId: item.productId },
            select: { stock: true }
          });

          const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: totalStock }
          });
        } else {
          // If no variant, reduce product stock directly
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
      }
    });

    // 9. Revalidate relevant pages
    revalidatePath(`/order/${order.id}`);
    revalidatePath('/my-account');
    revalidatePath('/admin/orders');
    for (const item of order.orderItems) {
      revalidatePath(`/shop-details/${item.productId}`);
    }

    // console.log(`Stock reduced for order ${order.id} repayment`);

    return NextResponse.json({
      success: true,
      message: 'Payment initiated successfully',
      checkoutRequestID: mpesaResult.CheckoutRequestID,
    });

  } catch (error: any) {
    console.error('Repay API Error:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('Insufficient stock')) {
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error. Please try again.' 
    }, { status: 500 });
  }
}

// Handle non-POST requests
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to retry payment.' },
    { status: 405 }
  );
}