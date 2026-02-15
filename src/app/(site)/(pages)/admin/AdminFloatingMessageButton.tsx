"use client";

import { useEffect, useState } from "react";
import { MessageCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

type UnreadStats = {
  total: number;
  urgent: number;
  active: number;
};

export default function AdminFloatingMessageButton() {
  const [unreadStats, setUnreadStats] = useState<UnreadStats>({ total: 0, urgent: 0, active: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUnreadStats();

    // Poll for new messages every 20 seconds (more frequent for admins)
    const interval = setInterval(() => {
      fetchUnreadStats();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadStats = async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      
      if (data.conversations) {
        const total = data.conversations.reduce(
          (sum: number, conv: any) => sum + conv._count.messages,
          0
        );
        const urgent = data.conversations.filter(
          (c: any) => (c.priority === 'URGENT' || c.priority === 'HIGH') && c._count.messages > 0
        ).length;
        const active = data.conversations.filter(
          (c: any) => c.status === 'ACTIVE' && c._count.messages > 0
        ).length;

        setUnreadStats({ total, urgent, active });
      }
    } catch (error) {
      console.error("Failed to fetch unread stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Link href="/admin/messages">
      <button
        className="fixed bottom-8 right-8 z-[998] group"
        aria-label={`Admin Messages ${unreadStats.total > 0 ? `(${unreadStats.total} unread)` : ''}`}
      >
        {/* Main Button */}
        <div className="relative">
          {/* Glow effect - red if urgent, blue otherwise */}
          <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 ${
            unreadStats.urgent > 0 ? 'bg-red' : 'bg-blue'
          }`} />
          
          {/* Button */}
          <div className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
            unreadStats.urgent > 0 
              ? 'bg-red group-hover:shadow-red/50' 
              : 'bg-blue group-hover:shadow-blue/50'
          }`}>
            <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
            
            {/* Unread Badge */}
            {unreadStats.total > 0 && (
              <div className="absolute -top-1 -right-1">
                <span className="flex h-7 w-7">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    unreadStats.urgent > 0 ? 'bg-yellow' : 'bg-red'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-7 w-7 items-center justify-center font-bold text-xs text-white ${
                    unreadStats.urgent > 0 ? 'bg-yellow' : 'bg-red'
                  }`}>
                    {unreadStats.total > 99 ? '99+' : unreadStats.total}
                  </span>
                </span>
              </div>
            )}

            {/* Urgent Indicator */}
            {unreadStats.urgent > 0 && (
              <div className="absolute -bottom-1 -left-1 bg-yellow rounded-full p-1 shadow-lg">
                <AlertCircle className="w-4 h-4 text-dark" strokeWidth={3} />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Tooltip for Admin */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-dark text-white px-4 py-3 rounded-lg shadow-2xl min-w-[200px]">
            <p className="text-sm font-bold mb-2">
              {unreadStats.total > 0 
                ? `${unreadStats.total} New Message${unreadStats.total > 1 ? 's' : ''}`
                : 'Customer Messages'
              }
            </p>
            
            {unreadStats.total > 0 && (
              <div className="space-y-1 text-xs text-gray-4 border-t border-gray-6 pt-2">
                {unreadStats.urgent > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red"></div>
                    <span>{unreadStats.urgent} Urgent</span>
                  </div>
                )}
                {unreadStats.active > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green"></div>
                    <span>{unreadStats.active} Active</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full right-6 -mt-1">
            <div className="w-2 h-2 bg-dark transform rotate-45"></div>
          </div>
        </div>
      </button>
    </Link>
  );
}