import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const billingInfo = await prisma.user.findUnique({
      where: { authId: user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        country: true,
        town: true,
      },
    });

    return NextResponse.json({ billingInfo });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json({ message: "Error fetching billing info" }, { status: 500 });
  }
}
