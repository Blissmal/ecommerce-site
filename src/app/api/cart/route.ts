// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 1. Try to find the user in your Prisma DB
    let dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true },
    });

    // 2. Just-in-Time Sync: If user doesn't exist in Prisma, create them now
    if (!dbUser) {
      // console.log(`User ${user.id} not found in DB, performing auto-sync...`);
      dbUser = await prisma.user.create({
        data: {
          authId: user.id,
          email: user.primaryEmail || null,
          name: user.displayName || user.primaryEmail?.split("@")[0] || "User",
          verified: user.primaryEmailVerified || false,
          role: "USER",
          createdAt: user.signedUpAt,
        },
        select: { id: true },
      });
    }

    const userId = dbUser.id;

    // 3. Fetch cart items using the confirmed userId
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            discount: true,
            category: { select: { name: true } }
          }
        },
        variant: true, // simplified for brevity, keep your specific selects if preferred
      },
    });

    // 4. Transform data
    const transformedCartItems = cartItems.map((item) => {
      const basePrice = item.variant?.price || 0;
      const discount = item.product.discount || 0;
      const rawDiscountedPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
      const discountedPrice = Math.round((rawDiscountedPrice + Number.EPSILON) * 100) / 100;

      return {
        id: item.id,
        title: item.product.title,
        price: basePrice,
        discountedPrice: discountedPrice,
        quantity: item.quantity,
        image: item.variant?.images?.[0] || item.product.imageUrl,
        stock: item.variant?.stock || 0,
        variantId: item.variantId,
        color: item.variant?.color,
        size: item.variant?.size,
        storage: item.variant?.storage,
        sku: item.variant?.sku,
        product: {
          ...item.product,
          category: item.product.category.name,
        },
      };
    });

    return NextResponse.json(transformedCartItems);
  } catch (error) {
    console.error('[CART_GET_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 🔹 POST — Add or increment a product variant in cart
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

    if (!userId) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { productId, variantId, quantity } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ 
      where: { id: productId },
      select: { id: true, discount: true, imageUrl: true, title: true }
    });
    
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Verify variant exists if variantId provided
    let variant = null;
    if (variantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: {
          id: true,
          sku: true,
          price: true,
          stock: true,
          color: true,
          size: true,
          storage: true,
          images: true,
        }
      });
      
      if (!variant) {
        return NextResponse.json({ message: 'Variant not found' }, { status: 404 });
      }
      
      // Check stock
      if (variant.stock < quantity) {
        return NextResponse.json({ 
          message: `Only ${variant.stock} items in stock` 
        }, { status: 400 });
      }
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: variantId || null,
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
        variantId: variantId || null,
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            discount: true,
          }
        },
        variant: {
          select: {
            id: true,
            sku: true,
            price: true,
            stock: true,
            color: true,
            size: true,
            storage: true,
            images: true,
          }
        }
      }
    });

    // Calculate discounted price for response
    const basePrice = cartItem.variant?.price || 0;
    const discount = cartItem.product.discount || 0;
    const hasDiscount = discount > 0;
    const discountedPrice = hasDiscount
      ? basePrice * (1 - discount / 100)
      : basePrice;

    // Return structured response with discountedPrice
    const response = {
      item: {
        id: cartItem.id,
        title: cartItem.product.title,
        price: basePrice,
        discountedPrice: discountedPrice,
        quantity: cartItem.quantity,
        image: cartItem.variant?.images?.[0] || cartItem.product.imageUrl,
        stock: cartItem.variant?.stock || 0,
        
        // Variant details
        variantId: cartItem.variantId,
        color: cartItem.variant?.color,
        size: cartItem.variant?.size,
        storage: cartItem.variant?.storage,
        sku: cartItem.variant?.sku,
        
        product: {
          id: cartItem.product.id,
          discount: cartItem.product.discount,
          imageUrl: cartItem.product.imageUrl,
          title: cartItem.product.title,
        },
      }
    };

    return NextResponse.json(response);
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

    if (!userId) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || !quantity || quantity < 1) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    // Get cart item with variant to check stock
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        variant: {
          select: { stock: true }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });
    }

    // Check stock if variant exists
    if (cartItem.variant && cartItem.variant.stock < quantity) {
      return NextResponse.json({ 
        message: `Only ${cartItem.variant.stock} items in stock` 
      }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
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

    if (!userId) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { cartItemId } = body;

    if (!cartItemId) {
      return NextResponse.json({ message: 'Cart item ID required' }, { status: 400 });
    }

    // console.log("Deleting cart item for user:", userId, "cartItemId:", cartItemId);

    await prisma.cartItem.delete({
      where: {
        id: cartItemId,
        userId, // Ensure user owns this cart item
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CART_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 🔹 PATCH — Clear entire cart
export async function PATCH(req: NextRequest) {
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
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CART_CLEAR_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}