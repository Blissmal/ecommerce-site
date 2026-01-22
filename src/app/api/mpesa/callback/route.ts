// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cancelOrder } from '../../../../../lib/order.action';
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

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          receipt: receiptNumber,
          paymentCompletedAt: new Date(),
        },
      });

      console.log(`✅ Payment successful for order ${order.id}: ${receiptNumber}`);

    } else if (ResultCode === 1032) {
      // ❌ User explicitly cancelled the payment
      console.log(`❌ Payment cancelled by user for order ${order.id}: ${ResultDesc}`);
      await cancelOrder(order.id);
      
    } else if (ResultCode === 1037) {
      // ⏱️ Timeout - user didn't enter PIN
      console.log(`⏱️ Payment timeout for order ${order.id}: ${ResultDesc}`);
      await cancelOrder(order.id);
      
    } else if (ResultCode === 1) {
      // ❌ Insufficient balance
      console.log(`❌ Insufficient balance for order ${order.id}: ${ResultDesc}`);
      await cancelOrder(order.id);
      
    } else {
      // ⚠️ Other error - cancel the order
      console.log(`⚠️ Payment error (${ResultCode}) for order ${order.id}: ${ResultDesc}`);
      await cancelOrder(order.id);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
}