import MyAccount from "@/components/MyAccount";

import { Metadata } from "next";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../../lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AccountPageSkeleton from "@/components/skeleton/MyAccountSkeleton";

export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account page for NextCommerce Template",
  // other metadata
};

export default async function MyAccountPage() {
  const user = await stackServerApp.getUser();
  
  if (!user) redirect("/handler/login");

  return (
    <main>
      <Suspense fallback={<AccountPageSkeleton />}>
        <AccountData userId={user.id} />
      </Suspense>
    </main>
  );
}

async function AccountData({ userId }: { userId: string }) {
  const userProfile = await prisma.user.findUnique({
    where: { authId: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      role: true,
    }
  });

  return <MyAccount userProfile={userProfile} app={stackServerApp.urls} />;
}

