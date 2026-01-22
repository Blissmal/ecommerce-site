import { NextRequest, NextResponse } from "next/server";
import { getOrderByCheckoutId } from "../../../../../lib/db";
import { mpesaService } from "../../../../../services/mpesaService";
import { cancelOrder, updateOrderStatus } from "../../../../../lib/order.action";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { checkoutRequestID } = await req.json();
    
    if (!checkoutRequestID) {
      return NextResponse.json(
        { message: 'checkoutRequestID is required' },
        { status: 400 }
      );
    }

    const order = await getOrderByCheckoutId(checkoutRequestID);

    if (!order) {
      return NextResponse.json({ 
        status: 'PENDING', 
        message: 'Order not found' 
      });
    }

    // If still pending, actively check with M-Pesa
    if (order.status === 'PENDING') {
      try {
        const mpesaStatus = await mpesaService.checkTransactionStatus(checkoutRequestID);
        
        console.log('M-Pesa Status Query Response:', mpesaStatus);

        // Check ResultCode (not ResponseCode)
        if (mpesaStatus.ResultCode === '0') {
          // ✅ Payment succeeded
          const metadata = mpesaStatus.CallbackMetadata?.Item || [];
          const receiptNumber = metadata.find((item: any) => 
            item.Name === 'MpesaReceiptNumber'
          )?.Value;

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              receipt: receiptNumber,
              paymentCompletedAt: new Date(),
            },
          });

          return NextResponse.json({ 
            status: 'PAID', 
            orderId: order.id,
            receipt: receiptNumber
          });
        } 
        else if (mpesaStatus.ResultCode === '1037') {
          // ⏳ Still processing (user hasn't entered PIN yet)
          return NextResponse.json({
            status: 'PENDING',
            orderId: order.id,
            message: 'Payment request is being processed'
          });
        }
        else if (mpesaStatus.ResultCode === '1032') {
          // ❌ User cancelled
          await cancelOrder(order.id);
          return NextResponse.json({ 
            status: 'CANCELLED', 
            orderId: order.id,
            message: 'Payment was cancelled'
          });
        }
        else {
          // ❌ Other failure (insufficient funds, timeout, etc.)
          await cancelOrder(order.id);
          return NextResponse.json({ 
            status: 'CANCELLED', 
            orderId: order.id,
            message: mpesaStatus.ResultDesc || 'Payment failed'
          });
        }
      } catch (mpesaError) {
        // If M-Pesa query fails, return current DB status
        console.error('M-Pesa query error:', mpesaError);
        return NextResponse.json({
          status: order.status,
          orderId: order.id,
          message: 'Unable to verify payment status'
        });
      }
    }

    // Return current status from DB (if not PENDING)
    return NextResponse.json({
      status: order.status,
      orderId: order.id,
      receipt: order.receipt,
      total: order.total
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}