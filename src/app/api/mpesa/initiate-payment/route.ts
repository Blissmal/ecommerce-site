import { createOrderWithItems, getUserCartItems, updateOrderPaymentDetails } from '../../../../../lib/db';
import { prisma } from '../../../../../lib/prisma';
import { mpesaService } from '../../../../../services/mpesaService';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, phoneNumber, billingName, billingEmail, billingAddress, orderNotes } = body;

    // 1. Validation
    if (!userId || !phoneNumber || !billingName || !billingEmail) {
      return Response.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // 2. Fresh data fetch
    const cartItems = await getUserCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      return Response.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    // 3. Process items and calculate total
    let totalAmount = 0;
    const itemsWithSnapshots = cartItems.map(item => {
      const basePrice = item.variant?.price || item.product.price;
      const discountAmount = item.product.discount ? (basePrice * item.product.discount) / 100 : 0;
      const finalPrice = basePrice - discountAmount;
      
      totalAmount += (finalPrice * item.quantity);

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: finalPrice,
        variantSnapshot: item.variant ? {
          color: item.variant.color,
          size: item.variant.size,
          storage: item.variant.storage,
          sku: item.variant.sku
        } : null
      };
    });

    // 4. Create Order in DB
    const order = await createOrderWithItems(userId, {
      total: totalAmount,
      phoneNumber,
      billingName,
      billingEmail,
      billingAddress,
      orderNotes
    }, itemsWithSnapshots);

    // 5. Format Phone for M-Pesa (254...)
    let formattedPhone = phoneNumber.replace(/\D/g, ''); 
    if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.slice(1)}`;
    if (!formattedPhone.startsWith('254')) formattedPhone = `254${formattedPhone}`;

    // 6. Initiate M-Pesa
    const mpesaResult = await mpesaService.initiateSTKPush(
      formattedPhone,
      Math.ceil(totalAmount),
      `ORD-${order.id.slice(-8)}`,
      `Payment for Order ${order.id.slice(-8)}`
    );

    if (mpesaResult.ResponseCode === '0') {
      await updateOrderPaymentDetails(order.id, {
        checkoutRequestId: mpesaResult.CheckoutRequestID,
        merchantRequestId: mpesaResult.MerchantRequestID
      });

      return Response.json({
        success: true,
        orderId: order.id,
        checkoutRequestID: mpesaResult.CheckoutRequestID,
      });
    } else {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
      return Response.json({ success: false, message: 'M-Pesa initiation failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Checkout API Error:', error);
    return Response.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle non-POST requests
export async function GET() {
  return Response.json({
    message: 'Method not allowed. Use POST to initiate payment.'
  }, { status: 405 });
}