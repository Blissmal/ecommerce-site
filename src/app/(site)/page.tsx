import Home from "@/components/Home/";
import { Metadata } from "next";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "NextCommerce | Nextjs E-commerce",
  description: "This is Home for NextCommerce",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
