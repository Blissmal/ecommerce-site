"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-white border-t border-gray-1 overflow-hidden font-euclid-circular-a">
      {/* Background Decor - Matching the Hero style */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue/5 rounded-full blur-[100px] -z-10 opacity-60" />

      <div className="max-w-screen-xl mx-auto px-6 pt-20 pb-10">
        
        {/* 1. Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Brand & Contact Column */}
          <div className="space-y-8">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/hustlesasa.png"
                alt="Hustlesasa Logo"
                width={150}
                height={45}
                className="brightness-90 w-auto h-auto"
              />
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
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
              {['facebook', 'instagram', 'twitter', 'linkedin'].map((social) => (
                <a key={social} href="#" className="w-11 h-11 rounded-2xl border border-gray-2 flex items-center justify-center text-body hover:text-blue hover:border-blue hover:bg-blue/5 transition-all duration-300">
                   <span className="sr-only">{social}</span>
                   <i className={`fab fa-${social} text-lg`}></i> 
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Bottom Bar */}
        <div className="pt-10 border-t border-gray-1 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[13px] text-body">
              &copy; {year} <span className="text-dark font-bold">Hustlesasa</span>. All rights reserved.
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