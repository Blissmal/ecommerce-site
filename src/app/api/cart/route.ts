import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '../../../../lib/prisma';

// 🔹 GET — Fetch all cart items for the user
export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userIdObj = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true },
    });

    const userId = userIdObj?.id;
    if (!userId) {
      return NextResponse.json({ message: 'User not found in DB' }, { status: 404 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    console.log("Cart items fetched for user:", userId, cartItems);

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('[CART_GET_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 🔹 POST — Add or increment a product in cart
export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userIdObj = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true },
    });
    const userId = userIdObj?.id;

    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        productId,
        quantity,
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('[CART_POST_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 🔹 PUT — Update quantity of a cart item
export async function PUT(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userIdObj = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true },
    });
    const userId = userIdObj?.id;

    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const updated = await prisma.cartItem.updateMany({
      where: {
        userId,
        id: productId,
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('[CART_PUT_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 🔹 DELETE — Remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userIdObj = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true },
    });
    const userId = userIdObj?.id;

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    console.log("Deleting cart item for user:", userId, "productId:", productId);

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CART_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
