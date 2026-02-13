"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  const socialLinks = [
    {
      name: "facebook",
      url: "#",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: "instagram",
      url: "#",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      name: "twitter",
      url: "#",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      name: "linkedin",
      url: "#",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    }
  ];

  return (
    <footer className="relative bg-white border-t border-gray-1 overflow-hidden font-euclid-circular-a">
      {/* Background Decor - Matching the Hero style */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue/5 rounded-full blur-[100px] -z-10 opacity-60" />

      <div className="max-w-screen-xl mx-auto px-6 pt-20 pb-10">

        {/* 1. Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* Brand & Contact Column */}
          <div className="space-y-8">
            <Link
              href="/"
            >
              <h3 className="text-dark font-bold uppercase tracking-[0.15em] text-[11px]">B-Shop</h3>
            </Link>

            <p className="text-body text-sm leading-relaxed max-w-xs">
              Kenya's premium marketplace for the latest <span className="text-dark font-semibold">mobiles</span>,
              stylish <span className="text-dark font-semibold">footwear</span>, and curated essentials.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-1 border border-gray-2 rounded-2xl w-fit">
                <Image src="/kenya.svg" alt="Kenya Flag" width={20} height={20} className="rounded-full" />
                <span className="text-[11px] font-bold text-dark uppercase tracking-widest">HQ: Nairobi, Kenya</span>
              </div>

              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue/5 flex items-center justify-center text-blue group-hover:bg-blue group-hover:text-white transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <p className="text-sm text-body group-hover:text-dark transition-colors font-medium">Parklands Rd, Westlands</p>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-7">
            <h3 className="text-dark font-bold uppercase tracking-[0.15em] text-[11px]">Shop Categories</h3>
            <ul className="space-y-4">
              {["Mobiles & Tablets", "Men's Shoes", "Women's Fashion", "Electronics", "New Arrivals"].map((link) => (
                <li key={link}>
                  <Link href="/shop-with-sidebar" className="text-body hover:text-blue text-sm transition-all flex items-center gap-0 hover:gap-2 group">
                    <span className="w-0 h-[1.5px] bg-blue transition-all group-hover:w-3" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-7">
            <h3 className="text-dark font-bold uppercase tracking-[0.15em] text-[11px]">Customer Support</h3>
            <ul className="space-y-4">
              {[
                { name: "My Account", href: "/my-account" },
                { name: "Track Order", href: "/my-account?tab=orders" },
                { name: "Shipping Policy", href: "#" },
                { name: "Refunds & Returns", href: "#" },
                { name: "FAQs", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-body hover:text-blue text-sm transition-colors block font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-7">
            <h3 className="text-dark font-bold uppercase tracking-[0.15em] text-[11px]">Stay Connected</h3>
            <p className="text-sm text-body leading-relaxed">Subscribe for exclusive offers and <span className="text-blue font-semibold">new arrivals</span>.</p>

            <div className="relative group">
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your email address"
                className="w-full bg-white border border-gray-3 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue focus:ring-4 focus:ring-blue/5 transition-all shadow-sm"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-dark text-white text-[10px] font-bold uppercase px-5 rounded-xl hover:bg-blue transition-all shadow-lg active:scale-95">
                Join
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-11 h-11 rounded-2xl border border-gray-2 flex items-center justify-center text-body hover:text-blue hover:border-blue hover:bg-blue/5 transition-all duration-300"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Bottom Bar */}
        <div className="pt-10 border-t border-gray-1 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[13px] text-body">
              &copy; {year} <span className="text-dark font-bold">B-Shop</span>. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-[10px] font-bold text-body hover:text-blue transition-colors uppercase tracking-widest">Privacy</Link>
              <Link href="#" className="text-[10px] font-bold text-body hover:text-blue transition-colors uppercase tracking-widest">Terms</Link>
            </div>
          </div>

          {/* Payment Badges - Styled to match the Hero tags */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-body uppercase tracking-widest mr-2">Secure Payments:</span>
            <div className="flex gap-2 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="px-3 py-1.5 bg-gray-1 border border-gray-2 rounded-lg text-[10px] font-black italic text-dark">M-PESA</div>
              <div className="px-3 py-1.5 bg-gray-1 border border-gray-2 rounded-lg text-[10px] font-black text-dark">VISA</div>
              <div className="px-3 py-1.5 bg-gray-1 border border-gray-2 rounded-lg text-[10px] font-black text-dark">MASTERCARD</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;