// src/app/api/sync-user/route.ts
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRecord = await prisma.user.findFirst({
    where: {
        authId: user.id
    },
    select: {
        id: true
    }
  })

  const userOrders = await prisma.order.findMany({
    where: {
        userId: userRecord?.id
    }
  })

  console.log("User Orders:", userOrders);

  

   return NextResponse.json(userOrders);
}
