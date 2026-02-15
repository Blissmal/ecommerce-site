"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@stackframe/stack";

type UnreadCount = {
  total: number;
  conversations: number;
};

export default function FloatingMessageButton() {
  const user = useUser();
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({ total: 0, conversations: 0 });
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    // Fetch immediately on mount
    fetchUnreadCount();

    // Poll for new messages every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      
      if (data.conversations) {
        const total = data.conversations.reduce(
          (sum: number, conv: any) => sum + conv._count.messages,
          0
        );
        setUnreadCount({
          total,
          conversations: data.conversations.filter((c: any) => c._count.messages > 0).length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    } finally {
      fetchingRef.current = false;
    }
  };

  // Don't show if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <Link href="/messages">
      <button
        className="fixed bottom-8 right-8 z-[998] group"
        aria-label={`Messages ${unreadCount.total > 0 ? `(${unreadCount.total} unread)` : ''}`}
      >
        {/* Main Button */}
        <div className="relative">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-blue rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          
          {/* Button */}
          <div className="relative w-14 h-14 bg-blue rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue/50">
            <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
            
            {/* Unread Badge */}
            {unreadCount.total > 0 && (
              <div className="absolute -top-1 -right-1">
                <span className="flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-red items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {unreadCount.total > 9 ? '9+' : unreadCount.total}
                    </span>
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-dark text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <p className="text-sm font-bold">
              {unreadCount.total > 0 
                ? `${unreadCount.total} new message${unreadCount.total > 1 ? 's' : ''}`
                : 'Messages'
              }
            </p>
            {unreadCount.conversations > 0 && (
              <p className="text-xs text-gray-4 mt-1">
                {unreadCount.conversations} conversation{unreadCount.conversations > 1 ? 's' : ''}
              </p>
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