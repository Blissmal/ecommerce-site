import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'; // Adjust path to your prisma instance
import { mpesaService } from '../../../../../services/mpesaService'; // Adjust path to your service

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, phoneNumber } = body;

    // 1. Validation
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Missing Order ID' }, { status: 400 });
    }

    // 2. Fetch Existing Order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    console.log('Fetched Order for Repay:', order);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // 3. Ensure Order is Eligible for Repayment
    // We allow retrying payment for PENDING or FAILED statuses
    if (order.status !== 'PENDING' && order.status !== 'FAILED') {
      return NextResponse.json({ 
        success: false, 
        message: `Order cannot be paid (Current status: ${order.status})` 
      }, { status: 400 });
    }

    // 4. Determine Phone Number
    // Use the new phone number provided by the user, or fallback to the one in the order
    const phoneToUse = phoneNumber || order.phoneNumber;

    if (!phoneToUse) {
        return NextResponse.json({ success: false, message: 'No phone number provided' }, { status: 400 });
    }

    // 5. Format Phone for M-Pesa (254...)
    let formattedPhone = phoneToUse.replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.slice(1)}`;
    if (!formattedPhone.startsWith('254')) formattedPhone = `254${formattedPhone}`;

    // 6. Initiate M-Pesa STK Push
    // We use the existing order Total
    const mpesaResult = await mpesaService.initiateSTKPush(
      formattedPhone,
      Math.ceil(order.total),
      `ORD-${order.id.slice(-8)}`, // Reference the existing Order ID
      `Retry Payment for Order ${order.id.slice(-8)}`
    );

    if (mpesaResult.ResponseCode === '0') {
      // 7. Update Order Payment Details
      // We update the request IDs so your callback handler knows this new transaction belongs to this order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          checkoutRequestId: mpesaResult.CheckoutRequestID,
          merchantRequestId: mpesaResult.MerchantRequestID,
          phoneNumber: formattedPhone, // Update phone in case they used a new one
          status: 'PENDING' // Reset status to PENDING in case it was FAILED
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Payment initiated successfully',
        checkoutRequestID: mpesaResult.CheckoutRequestID,
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'M-Pesa initiation failed. Please try again.' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Repay API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}