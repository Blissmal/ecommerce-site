// app/admin/AdminShell.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import AdminFloatingMessageButton from "./AdminFloatingMessageButton";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 7H7.01M7 3H12C12.5304 3 13.0391 3.21071 13.4142 3.58579L21.4142 11.5858C22.1953 12.3668 22.1953 13.6332 21.4142 14.4142L14.4142 21.4142C13.6332 22.1953 12.3668 22.1953 11.5858 21.4142L3.58579 13.4142C3.21071 13.0391 3 12.5304 3 12V7C3 4.79086 4.79086 3 7 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
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
        className={`fixed inset-y-0 left-0 z-[10001] w-72 bg-dark shadow-4 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:h-screen ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                className={`flex items-center px-4 py-3.5 rounded-xl text-custom-sm font-bold transition-all duration-200 group ${isActive
                    ? "bg-blue text-white shadow-lg shadow-blue/20"
                    : "text-body-dark hover:bg-dark-3 hover:text-white"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={`mr-3 transition-all duration-200 ${isActive ? 'text-white' : 'text-body-dark group-hover:text-white'}`}>
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
          <button className="mt-3 text-custom-xs font-bold text-blue-light-2 hover:text-white transition-colors">
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
      <AdminFloatingMessageButton />
    </div>
  );
}