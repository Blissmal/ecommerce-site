import React from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";

const EmptyCart = () => {
  const { closeCartModal } = useCartModalContext();

  return (
    <div className="text-center">
      <div className="mx-auto pb-7.5">
        <Image
          src="/NoCartItem.png"
          alt="Empty Cart"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>

      <p className="pb-6 font-bold">Ooops! No items found.</p>
      <p className="font-light">You don't have any items in your cart yet!</p>
    </div>
  );
};

export default EmptyCart;
