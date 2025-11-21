import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../../lib/prisma";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account page for NextCommerce Template",
  // other metadata
};

const MyAccountPage = async () => {
  const user = await stackServerApp.getUser();
  const app = stackServerApp.urls;
  if (!user) {
    redirect("/handler/login");
  }
  // const userProfile = await getUserDetails(user?.id);
  const userProfile = await prisma.user.findFirst({
    where: {
      authId: user.id
    }
  })
  return (
    <main>
      <MyAccount userProfile={userProfile} app={app}/>
    </main>
  );
};

export default MyAccountPage;
