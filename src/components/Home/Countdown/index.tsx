// components/Home/Countdown.tsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface CountdownProps {
  deadline: string;
  title: string;
  id: string;
  imageUrl: string;
  discount: number;
}

const CounDown = ({ deadline, title, id, imageUrl, discount }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.parse(deadline) - Date.now();
      if (time <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(time / (1000 * 60 * 60 * 24)),
        hours: Math.floor((time / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((time / 1000 / 60) % 60),
        seconds: Math.floor((time / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-lg bg-[#D0E9F3] p-4 sm:p-7.5 lg:p-10 xl:p-15">
          <div className="max-w-[422px] w-full">
            <span className="block font-medium text-blue mb-2.5">
              Limited Time Offer - {discount}% OFF!
            </span>

            <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3">
              {title}
            </h2>

            <div className="flex flex-wrap gap-6 mt-6">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((unit) => (
                <div key={unit.label}>
                  <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                    {unit.value < 10 ? `0${unit.value}` : unit.value}
                  </span>
                  <span className="block text-custom-sm text-dark text-center">{unit.label}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/shop-details/${id}`}
              className="inline-flex font-medium text-white bg-blue py-3 px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Grab it Now!
            </Link>
          </div>

          {/* Background & Dynamic Product Image */}
          <Image
            src="/images/countdown/countdown-bg.png"
            alt="bg"
            className="hidden sm:block absolute right-0 bottom-0 -z-1"
            width={737}
            height={482}
          />
          <div className="hidden lg:block absolute rounded-lg right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1">
             <Image
                src={imageUrl}
                alt={title}
                width={350}
                height={350}
                className="object-contain drop-shadow-2xl"
              />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounDown;