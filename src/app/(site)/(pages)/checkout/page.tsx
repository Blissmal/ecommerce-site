import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";
import { stackServerApp } from "@/stack";
import { prisma } from "../../../../../lib/prisma";
export const metadata: Metadata = {
  title: "Checkout Page | NextCommerce Nextjs E-commerce template",
  description: "This is Checkout Page for NextCommerce Template",
  // other metadata
};

const CheckoutPage = async () => {
  const user = await stackServerApp.getUser();
  const userObject = await prisma.user.findFirst({
    where: {
      authId: user.id
    },
    select: {
      id: true
    }
  });
  return (
    <main>
      <Checkout userId={userObject.id} />
    </main>
  );
};

export default CheckoutPage;
