// app/api/wishlist/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { stackServerApp } from "@/stack";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params first
    const { productId } = await params;
    
    const dbUser = await prisma.user.findUnique({
      where: {
        authId: user.id
      },
      select: {
        id: true,
      }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Check if the like exists before trying to delete
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_productId: {
          userId: dbUser.id,
          productId: productId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: "Item not in wishlist" },
        { status: 404 }
      );
    }

    await prisma.like.delete({
      where: {
        userId_productId: {
          userId: dbUser.id,
          productId: productId,
        },
      },
    });

    return NextResponse.json({ success: true, productId });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}