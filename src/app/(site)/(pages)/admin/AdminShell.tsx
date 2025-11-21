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
    <div className="flex min-h-screen bg-gray-50 relative z-[9999]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[10000] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[10001] w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>

        <nav className="mt-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:flex lg:flex-col bg-gray-1">
        {/* Top bar */}
        <div className="sticky top-0 z-[9999] bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              ☰
            </button>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Welcome, Admin</span>
                <div className="w-8 h-8 bg-blue-light rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>

              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Go to Site
              </Link>
            </div>
          </div>
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
