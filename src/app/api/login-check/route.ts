// src/app/api/me/route.ts
import { stackServerApp } from "@/stack";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: { id: user.id, email: user.primaryEmail } }, { status: 200 });
}
