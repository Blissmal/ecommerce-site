// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cancelOrder, restoreOrderStock, updateOrderStatus } from '@/lib/order.action';
import { prisma } from '@/lib/prisma';
import { clearUserCart } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // console.log('M-Pesa Callback Received:', JSON.stringify(body, null, 2));

    const { Body } = body;
    const { stkCallback } = Body;

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
      select: { id: true, status: true, userId: true },
    });

    if (!order) {
      console.error(`Order not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    // console.log(`Processing callback for order ${order.id}, ResultCode: ${ResultCode}`);

    // Handle different result codes
    if (ResultCode === 0) {
      // ✅ Payment successful
      const { CallbackMetadata } = stkCallback;
      const metadata = CallbackMetadata?.Item || [];

      const receiptNumber = metadata.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;

      // Update receipt first
      await prisma.order.update({
        where: { id: order.id },
        data: {
          receipt: receiptNumber,
        },
      });

      // Then update status (this triggers auto-message)
      await updateOrderStatus(order.id, 'PAID');

      // Clear cart only after successful payment
      await clearUserCart(order.userId);

      // console.log(`Payment successful for order ${order.id}: ${receiptNumber}`);
      // console.log(`Cart cleared for user ${order.userId}`);

    } else if (ResultCode === 1032) {
      // ❌ User explicitly cancelled the payment
      // Use cancelOrder() which sets status to CANCELLED, restores stock, and sends message
      // console.log(`Payment cancelled by user for order ${order.id}: ${ResultDesc}`);
      await cancelOrder(order.id);

    } else if (ResultCode === 1037) {
      // ⏱️ Timeout - user didn't enter PIN in time
      // console.log(`Payment timeout for order ${order.id}: ${ResultDesc}`);
      
      // Update status to FAILED (this triggers auto-message)
      await updateOrderStatus(order.id, 'FAILED');
      
      // Restore stock WITHOUT changing status
      await restoreOrderStock(order.id);

    } else if (ResultCode === 1) {
      // 💰 Insufficient balance
      // console.log(`Insufficient balance for order ${order.id}: ${ResultDesc}`);
      
      // Update status to FAILED (this triggers auto-message)
      await updateOrderStatus(order.id, 'FAILED');
      
      await restoreOrderStock(order.id);

    } else if (ResultCode === 2001) {
      // 🔐 Wrong PIN entered
      // console.log(`Wrong PIN for order ${order.id}: ${ResultDesc}`);
      
      // Update status to FAILED (this triggers auto-message)
      await updateOrderStatus(order.id, 'FAILED');
      
      await restoreOrderStock(order.id);

    } else if (ResultCode === 1001) {
      // ❌ Unable to complete transaction
      // console.log(`Transaction failed for order ${order.id}: ${ResultDesc}`);
      
      // Update status to FAILED (this triggers auto-message)
      await updateOrderStatus(order.id, 'FAILED');
      
      await restoreOrderStock(order.id);

    } else {
      // ⚠️ Other unknown error - mark as FAILED
      // console.log(`Payment error (${ResultCode}) for order ${order.id}: ${ResultDesc}`);
      
      // Update status to FAILED (this triggers auto-message)
      await updateOrderStatus(order.id, 'FAILED');
      
      await restoreOrderStock(order.id);
    }

    // M-Pesa requires 200 with ResultCode 0
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Still return success to M-Pesa to prevent retries
    // Log the error for manual investigation
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
}