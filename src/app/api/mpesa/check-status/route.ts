// // Payment Status Check API: pages/api/mpesa/check-status.js

// import { getOrderByCheckoutId } from "../../../../../lib/db";

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const { checkoutRequestID } = req.body;

//     if (!checkoutRequestID) {
//       return res.status(400).json({ message: 'checkoutRequestID is required' });
//     }

//     // Get order from database
//     const order = await getOrderByCheckoutId(checkoutRequestID);

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     res.status(200).json({
//       status: order.status,
//       orderId: order.id,
//       receipt: order.receipt,
//       total: order.total
//     });
//   } catch (error) {
//     console.error('Status check error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { getOrderByCheckoutId } from '../../../../../lib/db';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutRequestID } = body;

    if (!checkoutRequestID) {
      return NextResponse.json(
        { message: 'checkoutRequestID is required' },
        { status: 400 }
      );
    }

    const order = await getOrderByCheckoutId(checkoutRequestID);

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

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