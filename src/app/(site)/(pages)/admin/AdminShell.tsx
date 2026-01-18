// app/admin/_components/AdminShell.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Products", href: "/admin/products", icon: "📦" },
  { name: "Categories", href: "/admin/categories", icon: "🏷️" },
  { name: "Orders", href: "/admin/orders", icon: "📋" },
  { name: "Add Product", href: "/admin/add-product", icon: "➕" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-meta font-euclid-circular-a relative z-[9999]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[10000] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[10001] w-72 bg-dark shadow-4 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center px-8 h-20 border-b border-dark-3">
          <div className="w-8 h-8 bg-blue rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-heading-6 font-bold text-white tracking-tight">
            Store<span className="text-blue">Admin</span>
          </h1>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3.5 rounded-xl text-custom-sm font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-blue text-white shadow-lg shadow-blue/20"
                    : "text-body-dark hover:bg-dark-3 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={`mr-3 text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'brightness-125' : 'grayscale opacity-70'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer/Support */}
        <div className="absolute bottom-6 left-4 right-4 p-4 bg-dark-3 rounded-2xl border border-white/5">
          <p className="text-2xs font-bold text-dark-5 uppercase tracking-widest mb-1">Support</p>
          <p className="text-custom-xs text-body-dark">Need help with the panel?</p>
          <button className="mt-3 text-custom-xs font-bold text-blue hover:text-white transition-colors">
            Contact Developer
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-3 sticky top-0 z-[9999] px-6 lg:px-10">
          <div className="flex items-center justify-between h-full">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-dark hover:bg-gray-2 rounded-lg lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            <div className="flex items-center gap-6 ml-auto">
              <Link href="/" className="text-custom-sm font-bold text-dark-5 hover:text-blue transition-colors">
                View Storefront
              </Link>
              
              <div className="h-8 w-[1px] bg-gray-3 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-custom-sm font-bold text-dark leading-none mb-1">Admin User</p>
                  <p className="text-2xs font-bold text-blue uppercase tracking-tighter">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-blue-light-6 rounded-full border border-blue-light-4 flex items-center justify-center">
                  <span className="text-blue-dark font-bold">AD</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}