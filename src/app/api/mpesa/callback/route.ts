// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, cancelOrder } from '../../../../../lib/order.action';
import { prisma } from '../../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Body } = body;
    const { stkCallback } = Body;

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
      select: { id: true, status: true },
    });

    if (!order) {
      console.error(`Order not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    if (ResultCode === 0) {
      // ✅ Payment successful
      const { CallbackMetadata } = stkCallback;
      const metadata = CallbackMetadata.Item || [];

      const receiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;

      // Update order to PAID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          receipt: receiptNumber,
          paymentCompletedAt: new Date(),
        },
      });

      console.log(`✅ Payment successful for order ${order.id}: ${receiptNumber}`);

    } else {
      // ❌ Payment failed or cancelled
      console.log(`❌ Payment failed for order ${order.id}: ${ResultDesc}`);

      // Cancel order and restore stock
      await cancelOrder(order.id);
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