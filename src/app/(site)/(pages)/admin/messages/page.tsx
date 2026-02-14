"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, User, Clock, AlertCircle } from "lucide-react";

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'urgent'>('all');

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  const fetchConversations = async () => {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    
    let filtered = data.conversations;
    if (filter === 'active') {
      filtered = filtered.filter((c: any) => c.status === 'ACTIVE');
    } else if (filter === 'urgent') {
      filtered = filtered.filter((c: any) => c.priority === 'URGENT' || c.priority === 'HIGH');
    }
    
    setConversations(filtered);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Messages</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue text-white' : 'bg-gray-1'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-blue text-white' : 'bg-gray-1'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-lg ${filter === 'urgent' ? 'bg-red text-white' : 'bg-gray-1'}`}
          >
            Urgent
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/admin/messages/${conv.id}`}
            className="p-4 bg-white border border-gray-2 rounded-xl hover:border-blue transition"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-5" />
                <div>
                  <p className="font-bold">{conv.user.name || conv.user.email}</p>
                  <p className="text-sm text-gray-5">{conv.subject}</p>
                </div>
              </div>
              
              {conv._count.messages > 0 && (
                <span className="bg-red text-white text-xs px-2 py-1 rounded-full">
                  {conv._count.messages} new
                </span>
              )}
            </div>

            {conv.order && (
              <p className="text-xs text-gray-4 mb-2">
                Order: #{conv.order.id.slice(-8).toUpperCase()} • KES {conv.order.total.toFixed(2)}
              </p>
            )}

            {conv.messages[0] && (
              <p className="text-sm text-gray-4 line-clamp-2 mb-2">
                {conv.messages[0].content}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(conv.lastMessageAt).toLocaleString()}
              </div>
              
              {conv.priority !== 'NORMAL' && (
                <div className={`flex items-center gap-1 ${
                  conv.priority === 'URGENT' ? 'text-red' : 'text-yellow'
                }`}>
                  <AlertCircle className="w-3 h-3" />
                  {conv.priority}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}