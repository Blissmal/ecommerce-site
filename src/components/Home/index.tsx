import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import { prisma } from "../../../lib/prisma";

const Home = async () => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  return (
    <main>
      <Hero />
      <Categories categories={categories} />
      <NewArrival />
      {/* <PromoBanner />
      <BestSeller />
      <CounDown />
      <Testimonials /> */}
      {/* <Newsletter /> */}
    </main>
  );
};

export default Home;
