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

    // Transform cart items to include calculated discountedPrice
    const transformedCartItems = cartItems.map((item) => {
      // Calculate discounted price
      const hasDiscount = item.product.discount && item.product.discount > 0;
      const discountedPrice = hasDiscount
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;

      return {
        id: item.id,
        title: item.product.title,
        price: item.product.price, // Original price
        discountedPrice: discountedPrice, // Calculated discounted price
        quantity: item.quantity,
        image: item.product.imageUrl,
        stock: item.product.stock,
        product: {
          id: item.product.id,
          discount: item.product.discount,
          imageUrl: item.product.imageUrl,
          title: item.product.title,
          description: item.product.description,
          price: item.product.price,
          stock: item.product.stock,
        },
      };
    });

    console.log("Cart items fetched for user:", userId, transformedCartItems);

    return NextResponse.json(transformedCartItems);
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
      include: {
        product: true,
      },
    });

    // Calculate discounted price for response
    const hasDiscount = cartItem.product.discount && cartItem.product.discount > 0;
    const discountedPrice = hasDiscount
      ? cartItem.product.price * (1 - cartItem.product.discount / 100)
      : cartItem.product.price;

    // Return structured response with discountedPrice
    const response = {
      id: cartItem.id,
      title: cartItem.product.title,
      price: cartItem.product.price,
      discountedPrice: discountedPrice,
      quantity: cartItem.quantity,
      image: cartItem.product.imageUrl,
      stock: cartItem.product.stock,
      product: {
        id: cartItem.product.id,
        discount: cartItem.product.discount,
        imageUrl: cartItem.product.imageUrl,
        title: cartItem.product.title,
        description: cartItem.product.description,
        price: cartItem.product.price,
        stock: cartItem.product.stock,
      },
    };

    return NextResponse.json({ item: response });
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