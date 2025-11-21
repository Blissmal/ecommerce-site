// src/app/api/sync-user/route.ts
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.upsert({
    where: { authId: user.id },
    update: {
      name: user.displayName || user.primaryEmail?.split("@")[0] || null,
      email: user.primaryEmail || null,
      phone: null,
      address: null,
    },
    create: {
      authId: user.id, // Ensure this matches your user object structure
      email: user.primaryEmail || null,
      name: user.displayName || user.primaryEmail?.split("@")[0] || null,
      phone: null,
      address: null,
      verified: user.primaryEmailVerified || false,
      role: "USER", // Default role, adjust as necessary
      createdAt: user.signedUpAt,
    },
  });

  return NextResponse.json({ message: "User synced" });
  } catch (error) {
    console.error("[SYNC_USER_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    
  }
}
