// // App Router API Route: src/app/api/mpesa/initiate-payment/route.js
// import { createOrderWithItems, getUserCartItems, updateOrderPaymentDetails } from '../../../../../lib/db';
// import { prisma } from '../../../../../lib/prisma';
// import { mpesaService } from '../../../../../services/mpesaService';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const {
//       userId,           // Required: User ID
//       phoneNumber,      // Required: Phone number for M-Pesa
//       billingName,      // Required: Customer name
//       billingEmail,     // Required: Customer email
//       billingAddress,   // Optional: Customer address
//       orderNotes        // Optional: Order notes
//     } = body;

//     // Validation
//     if (!userId || !phoneNumber || !billingName || !billingEmail) {
//       return Response.json({
//         success: false,
//         message: 'Missing required fields: userId, phoneNumber, billingName, billingEmail'
//       }, { status: 400 });
//     }

//     // Get user's cart items
//     const cartItems = await getUserCartItems(userId);
    
//     if (!cartItems || cartItems.length === 0) {
//       return Response.json({
//         success: false,
//         message: 'Cart is empty'
//       }, { status: 400 });
//     }

//     // Calculate total amount
//     const totalAmount = cartItems.reduce((sum, item) => {
//       const price = item.product.discount
//         ? item.product.price * (1 - item.product.discount)
//         : item.product.price;
//       return sum + (price * item.quantity);
//     }, 0);

//     // Create order in database
//     const order = await createOrderWithItems(userId, {
//       total: totalAmount,
//       phoneNumber,
//       billingName,
//       billingEmail,
//       billingAddress,
//       orderNotes
//     }, cartItems.map(item => ({
//       productId: item.productId,
//       quantity: item.quantity,
//       price: item.product.discount
//         ? item.product.price * (1 - item.product.discount)
//         : item.product.price
//     })));

//     // Format phone number for M-Pesa
//     const formattedPhone = phoneNumber.startsWith('254')
//       ? phoneNumber
//       : `254${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}`;

//     // Initiate M-Pesa STK Push
//     const mpesaResult = await mpesaService.initiateSTKPush(
//       formattedPhone,
//       Math.ceil(totalAmount), // M-Pesa requires integer amounts
//       `ORDER-${order.id.slice(-8)}`, // Use last 8 chars of order ID
//       `Payment for order ${order.id.slice(-8)}`
//     );

//     if (mpesaResult.ResponseCode === '0') {
//       // Update order with M-Pesa details
//       await updateOrderPaymentDetails(order.id, {
//         checkoutRequestId: mpesaResult.CheckoutRequestID,
//         merchantRequestId: mpesaResult.MerchantRequestID
//       });

//       return Response.json({
//         success: true,
//         orderId: order.id,
//         checkoutRequestID: mpesaResult.CheckoutRequestID,
//         message: 'STK push sent successfully. Check your phone for M-Pesa prompt.',
//         totalAmount
//       });
//     } else {
//       // Update order status to failed
//       await prisma.order.update({
//         where: { id: order.id },
//         data: { status: 'FAILED' }
//       });

//       return Response.json({
//         success: false,
//         message: mpesaResult.ResponseDescription || 'Payment initiation failed'
//       }, { status: 400 });
//     }
//   } catch (error) {
//     console.error('Payment initiation error:', error);
//     return Response.json({
//       success: false,
//       message: 'Internal server error'
//     }, { status: 500 });
//   }
// }

// // Optional: Add other HTTP methods if needed
// export async function GET() {
//   return Response.json({
//     message: 'Method not allowed'
//   }, { status: 405 });
// }

// App Router API Route: src/app/api/mpesa/initiate-payment/route.js
import { createOrderWithItems, getUserCartItems, updateOrderPaymentDetails } from '../../../../../lib/db';
import { prisma } from '../../../../../lib/prisma';
import { mpesaService } from '../../../../../services/mpesaService';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      userId,           // Required: User ID
      phoneNumber,      // Required: Phone number for M-Pesa
      billingName,      // Required: Customer name
      billingEmail,     // Required: Customer email
      billingAddress,   // Optional: Customer address
      orderNotes        // Optional: Order notes
    } = body;

    // Validation
    if (!userId || !phoneNumber || !billingName || !billingEmail) {
      return Response.json({
        success: false,
        message: 'Missing required fields: userId, phoneNumber, billingName, billingEmail'
      }, { status: 400 });
    }

    // Get user's cart items (Fixed typo: was getUtserCartItems)
    const cartItems = await getUserCartItems(userId);
        
    if (!cartItems || cartItems.length === 0) {
      return Response.json({
        success: false,
        message: 'Cart is empty'
      }, { status: 400 });
    }

    // Calculate total amount
    // const totalAmount = cartItems.reduce((sum, item) => {
    //   const price = item.product.discount
    //     ? item.product.price * (1 - item.product.discount)
    //     : item.product.price;
    //   return sum + (price * item.quantity);
    // }, 0);

    const totalAmount = 1  //for testing purposes 😊
    

    // Validate minimum amount (M-Pesa minimum is 1 KES)
    if (totalAmount < 1) {
      return Response.json({
        success: false,
        message: 'Order amount must be at least 1 KES'
      }, { status: 400 });
    }

    // Create order in database
    const order = await createOrderWithItems(userId, {
      total: totalAmount,
      phoneNumber,
      billingName,
      billingEmail,
      billingAddress,
      orderNotes
    }, cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.discount
        ? item.product.price * (1 - item.product.discount)
        : item.product.price
    })));

    // Format phone number for M-Pesa (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\s/g, ''); // Remove spaces
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.slice(1)}`;
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = `254${formattedPhone}`;
    }

    // Validate phone number format (should be 12 digits starting with 254)
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return Response.json({
        success: false,
        message: 'Invalid phone number format. Use format: 0712345678 or 254712345678'
      }, { status: 400 });
    }

    // Initiate M-Pesa STK Push
    const mpesaResult = await mpesaService.initiateSTKPush(
      formattedPhone,
      Math.ceil(totalAmount), // M-Pesa requires integer amounts
      `ORDER-${order.id.slice(-8)}`, // Use last 8 chars of order ID
      `Payment for order ${order.id.slice(-8)}`
    );

    if (mpesaResult.ResponseCode === '0') {
      // Update order with M-Pesa details
      await updateOrderPaymentDetails(order.id, {
        checkoutRequestId: mpesaResult.CheckoutRequestID,
        merchantRequestId: mpesaResult.MerchantRequestID,
        mpesaReceiptNumber: null, // Will be updated on callback
        status: 'PENDING'
      });

      return Response.json({
        success: true,
        orderId: order.id,
        checkoutRequestID: mpesaResult.CheckoutRequestID,
        message: 'STK push sent successfully. Check your phone for M-Pesa prompt.',
        totalAmount
      });
    } else {
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' }
      });

      return Response.json({
        success: false,
        message: mpesaResult.ResponseDescription || 'Payment initiation failed',
        errorCode: mpesaResult.ResponseCode
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    return Response.json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Handle non-POST requests
export async function GET() {
  return Response.json({
    message: 'Method not allowed. Use POST to initiate payment.'
  }, { status: 405 });
}