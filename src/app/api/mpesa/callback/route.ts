import { NextRequest, NextResponse } from 'next/server';
import { updateOrderPaymentStatus, clearUserCart } from '../../../../../lib/db';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { Body } = body;
    const { stkCallback } = Body;

    // console.log('M-Pesa Callback:', JSON.stringify(stkCallback, null, 2));

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const { CallbackMetadata } = stkCallback;
      const metadata = CallbackMetadata.Item || [];

      const receiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;

      const updatedOrder = await updateOrderPaymentStatus(
        CheckoutRequestID,
        'PAID',
        receiptNumber
      );

      if (updatedOrder) {
        await clearUserCart(updatedOrder.userId);
        // console.log(`✅ Payment successful for order ${updatedOrder.id}: ${receiptNumber}`);
      }
    } else {
      // Payment failed or cancelled
      await updateOrderPaymentStatus(CheckoutRequestID, 'FAILED');
      // console.log('❌ Payment failed:', ResultDesc);
    }

    // M-Pesa requires 200 with ResultCode 0
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal server error' }, { status: 500 });
  }
}
