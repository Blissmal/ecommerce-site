// // app/api/mpesa/check-status/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getOrderByCheckoutId } from "../../../../../lib/db";
// import { mpesaService } from "../../../../../services/mpesaService";
// import { cancelOrder, restoreOrderStock } from "../../../../../lib/order.action";
// import { prisma } from "../../../../../lib/prisma";
// import { clearUserCart } from "../../../../../lib/db";

// export async function POST(req: NextRequest) {
//   try {
//     const { checkoutRequestID } = await req.json();
    
//     if (!checkoutRequestID) {
//       return NextResponse.json(
//         { message: 'checkoutRequestID is required' },
//         { status: 400 }
//       );
//     }

//     const order = await getOrderByCheckoutId(checkoutRequestID);

//     if (!order) {
//       return NextResponse.json({ 
//         status: 'PENDING', 
//         message: 'Order not found' 
//       });
//     }

//     // If order is already in final state, return that status
//     if (['PAID', 'CANCELLED', 'FAILED'].includes(order.status)) {
//       return NextResponse.json({
//         status: order.status,
//         orderId: order.id,
//         receipt: order.receipt,
//         total: order.total
//       });
//     }

//     // If still pending, actively check with M-Pesa
//     if (order.status === 'PENDING') {
//       try {
//         const mpesaStatus = await mpesaService.checkTransactionStatus(checkoutRequestID);
        
//         console.log('M-Pesa Status Query Response:', mpesaStatus);

//         // Check ResultCode
//         if (mpesaStatus.ResultCode === '0') {
//           // ✅ Payment succeeded
//           const metadata = mpesaStatus.CallbackMetadata?.Item || [];
//           const receiptNumber = metadata.find((item: any) => 
//             item.Name === 'MpesaReceiptNumber'
//           )?.Value;

//           await prisma.order.update({
//             where: { id: order.id },
//             data: {
//               status: 'PAID',
//               receipt: receiptNumber,
//               paymentCompletedAt: new Date(),
//             },
//           });

//           // Clear cart after successful payment
//           await clearUserCart(order.userId);
//           console.log(`🗑️ Cart cleared for user ${order.userId} via polling`);

//           return NextResponse.json({ 
//             status: 'PAID', 
//             orderId: order.id,
//             receipt: receiptNumber
//           });
//         } 
//         else if (mpesaStatus.ResultCode === '1037') {
//           // ⏳ Still processing (user hasn't entered PIN yet)
//           return NextResponse.json({
//             status: 'PENDING',
//             orderId: order.id,
//             message: 'Payment request is being processed'
//           });
//         }
//         else if (mpesaStatus.ResultCode === '1032') {
//           // ❌ User cancelled
//           await prisma.order.update({
//             where: { id: order.id },
//             data: { status: 'CANCELLED' }
//           });
          
//           await cancelOrder(order.id);
          
//           return NextResponse.json({ 
//             status: 'CANCELLED', 
//             orderId: order.id,
//             message: 'Payment was cancelled by user'
//           });
//         }
//         else if (['1', '1001', '2001'].includes(mpesaStatus.ResultCode)) {
//           // 💰 Insufficient balance, wrong PIN, or transaction failed
//           // Mark as FAILED so user can retry
//           await prisma.order.update({
//             where: { id: order.id },
//             data: { status: 'FAILED' }
//           });
          
//           // Restore stock WITHOUT changing status
//           await restoreOrderStock(order.id);
          
//           return NextResponse.json({ 
//             status: 'FAILED', 
//             orderId: order.id,
//             message: mpesaStatus.ResultDesc || 'Payment failed'
//           });
//         }
//         else {
//           // ❌ Other failure
//           await prisma.order.update({
//             where: { id: order.id },
//             data: { status: 'FAILED' }
//           });
          
//           // Restore stock WITHOUT changing status
//           await restoreOrderStock(order.id);
          
//           return NextResponse.json({ 
//             status: 'FAILED', 
//             orderId: order.id,
//             message: mpesaStatus.ResultDesc || 'Payment failed'
//           });
//         }
//       } catch (mpesaError) {
//         // If M-Pesa query fails, return current DB status
//         console.error('M-Pesa query error:', mpesaError);
//         return NextResponse.json({
//           status: order.status,
//           orderId: order.id,
//           message: 'Unable to verify payment status'
//         });
//       }
//     }

//     // Return current status from DB (for other statuses)
//     return NextResponse.json({
//       status: order.status,
//       orderId: order.id,
//       receipt: order.receipt,
//       total: order.total
//     });

//   } catch (error) {
//     console.error('Status check error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
// app/api/mpesa/check-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrderByCheckoutId } from "../../../../../lib/db";
import { mpesaService } from "../../../../../services/mpesaService";
import { cancelOrder, restoreOrderStock } from "../../../../../lib/order.action";
import { prisma } from "../../../../../lib/prisma";
import { clearUserCart } from "../../../../../lib/db";

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

    // If order is already in final state, return that status
    if (['PAID', 'CANCELLED', 'FAILED'].includes(order.status)) {
      return NextResponse.json({
        status: order.status,
        orderId: order.id,
        receipt: order.receipt,
        total: order.total
      });
    }

    // If still pending, actively check with M-Pesa
    if (order.status === 'PENDING') {
      try {
        const mpesaStatus = await mpesaService.checkTransactionStatus(checkoutRequestID);
        
        console.log('M-Pesa Status Query Response:', mpesaStatus);

        // ✅ SUCCESS - Payment completed
        if (mpesaStatus.ResultCode === '0') {
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

          await clearUserCart(order.userId);
          console.log(`🗑️ Cart cleared for user ${order.userId} via polling`);

          return NextResponse.json({ 
            status: 'PAID', 
            orderId: order.id,
            receipt: receiptNumber
          });
        }
        
        // ⏳ PROCESSING - Transaction still in progress
        // Common codes: 1037 (Timeout), 4999 (Processing)
        else if (['1037', '4999'].includes(mpesaStatus.ResultCode)) {
          return NextResponse.json({
            status: 'PENDING',
            orderId: order.id,
            message: 'Payment request is being processed. Please wait...'
          });
        }
        
        // ❌ CANCELLED - User cancelled the transaction
        else if (mpesaStatus.ResultCode === '1032') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' }
          });
          
          await cancelOrder(order.id);
          
          return NextResponse.json({ 
            status: 'CANCELLED', 
            orderId: order.id,
            message: 'Payment was cancelled by user'
          });
        }
        
        // 💰 FAILED - Common failure codes
        // 1: Insufficient balance
        // 1001: Invalid PIN or insufficient balance
        // 2001: Wrong PIN attempts exceeded
        else if (['1', '1001', '2001'].includes(mpesaStatus.ResultCode)) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'FAILED' }
          });
          
          await restoreOrderStock(order.id);
          
          return NextResponse.json({ 
            status: 'FAILED', 
            orderId: order.id,
            message: mpesaStatus.ResultDesc || 'Payment failed. Please try again.'
          });
        }
        
        // ❌ OTHER FAILURES - Any other non-success code
        else {
          console.warn(`⚠️ Unhandled M-Pesa ResultCode: ${mpesaStatus.ResultCode}`);
          
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'FAILED' }
          });
          
          await restoreOrderStock(order.id);
          
          return NextResponse.json({ 
            status: 'FAILED', 
            orderId: order.id,
            message: mpesaStatus.ResultDesc || 'Payment failed. Please try again.',
            resultCode: mpesaStatus.ResultCode // Include for debugging
          });
        }
      } catch (mpesaError) {
        console.error('M-Pesa query error:', mpesaError);
        return NextResponse.json({
          status: order.status,
          orderId: order.id,
          message: 'Unable to verify payment status. Please try again.'
        });
      }
    }

    // Return current status from DB (for other statuses)
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