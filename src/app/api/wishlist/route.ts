// app/api/wishlist/route.ts
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET - Fetch user's wishlist
export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({
        where: {
            authId: user.id
        },
        select: {
            id: true,
        }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const wishlist = await prisma.like.findMany({
      where: { userId: dbUser.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            discount: true,
            discountExpiry: true,
            imageUrl: true,
            stock: true,
            brand: true,
            model: true,
          },
        },
      },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Add to wishlist
export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({
        where: {
            authId: user.id
        },
        select: {
            id: true,
        }
    })

    const { productId } = await req.json();

    // Check if already in wishlist
    const existing = await prisma.like.findUnique({
      where: {
        userId_productId: {
          userId: dbUser.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already in wishlist" },
        { status: 400 }
      );
    }

    const like = await prisma.like.create({
      data: {
        userId: dbUser.id,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            discount: true,
            imageUrl: true,
            stock: true,
            brand: true,
            model: true,
          },
        },
      },
    });

    return NextResponse.json(like);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}