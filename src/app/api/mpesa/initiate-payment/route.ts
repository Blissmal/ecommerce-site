// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/order.action';
import { getUserCartItems, clearUserCart } from '@/lib/db';
import { mpesaService } from '@/services/mpesaService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phoneNumber, billingName, billingEmail, billingAddress, orderNotes } = body;

    // 1. Validation
    if (!userId || !phoneNumber || !billingName || !billingEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // 2. Get fresh cart data
    const cartItems = await getUserCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' }, 
        { status: 400 }
      );
    }

    // 3. Calculate total with active discounts
    let totalAmount = 0;
    const now = new Date();

    const orderItems = cartItems.map(item => {
      // Get base price from variant or product
      const basePrice = item.variant?.price || item.product.price || 0;

      // Check if discount is still valid
      const isExpired = 
        item.product.discountExpiry && 
        new Date(item.product.discountExpiry) < now;
      
      const activeDiscount = isExpired ? 0 : (item.product.discount || 0);

      // Calculate final discounted price
      const rawDiscountedPrice = activeDiscount > 0 
        ? basePrice * (1 - activeDiscount / 100) 
        : basePrice;
      
      // Round to 2 decimal places
      const finalPrice = Math.round((rawDiscountedPrice + Number.EPSILON) * 100) / 100;
      
      totalAmount += (finalPrice * item.quantity);

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: finalPrice,
      };
    });

    // Round total to 2 decimal places
    //totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
    totalAmount = 2; // For testing M-Pesa with fixed amount

    // 4. Format phone number for M-Pesa
    let formattedPhone = phoneNumber.replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.slice(1)}`;
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = `254${formattedPhone}`;
    }

    // 5. Initiate M-Pesa FIRST (before creating order)
    const mpesaResult = await mpesaService.initiateSTKPush(
      formattedPhone,
      Math.ceil(totalAmount),
      `ORD-${Date.now()}`, // Temporary account reference
      `Payment for order`
    );

    // 6. Check M-Pesa response
    if (mpesaResult.ResponseCode !== '0') {
      return NextResponse.json(
        { 
          success: false, 
          message: mpesaResult.CustomerMessage || 'M-Pesa initiation failed' 
        }, 
        { status: 400 }
      );
    }

    // 7. Create order ONLY if M-Pesa initiation was successful
    const order = await createOrder({
      userId,
      items: orderItems,
      totalAmount,
      paymentMethod: 'MPESA',
      phoneNumber: formattedPhone,
      checkoutRequestId: mpesaResult.CheckoutRequestID,
      merchantRequestId: mpesaResult.MerchantRequestID,
      billingName,
      billingEmail,
      billingAddress,
      orderNotes,
    });

    // 8. Clear cart immediately after order creation
    // This prevents duplicate orders if user refreshes
    await clearUserCart(userId);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      checkoutRequestID: mpesaResult.CheckoutRequestID,
      message: 'Payment initiated. Please complete on your phone.',
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    
    // Return user-friendly error messages
    if (error.message.includes('Insufficient stock')) {
      return NextResponse.json(
        { success: false, message: error.message }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to process checkout. Please try again.' }, 
      { status: 500 }
    );
  }
}

// Handle non-POST requests
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to initiate payment.' },
    { status: 405 }
  );
}