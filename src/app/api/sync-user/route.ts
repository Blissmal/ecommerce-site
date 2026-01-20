// src/app/api/sync-user/route.ts
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const existingUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    const name = user.displayName || user.primaryEmail?.split("@")[0] || null;
    const email = user.primaryEmail || null;

    // Only update if the user doesn't exist OR if critical data has changed
    if (!existingUser || existingUser.email !== email || existingUser.name !== name) {
      await prisma.user.upsert({
        where: { authId: user.id },
        update: { name, email },
        create: {
          authId: user.id,
          email,
          name,
          verified: user.primaryEmailVerified || false,
          role: "USER",
          createdAt: user.signedUpAt,
        },
      });
      return NextResponse.json({ message: "User synced", synced: true });
    }

    return NextResponse.json({ message: "No sync required", synced: false });
  } catch (error) {
    console.error("[SYNC_USER_ERROR]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}