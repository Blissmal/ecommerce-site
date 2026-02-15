"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Clock, Package, ArrowRight, Loader2 } from "lucide-react";

type Conversation = {
  id: string;
  subject: string;
  lastMessageAt: string;
  status: string;
  priority: string;
  order?: { 
    id: string; 
    status: string;
    total: number;
  };
  messages: { 
    content: string; 
    createdAt: string;
    senderType: string;
  }[];
  _count: { messages: number };
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-24 flex items-center justify-center font-euclid-circular-a">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue mx-auto mb-4 animate-spin" />
          <p className="text-body">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-24 font-euclid-circular-a">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-heading-3 font-bold text-dark mb-2">
            Messages
          </h1>
          <p className="text-body">
            View and manage your conversations with our support team
          </p>
        </div>

        {/* Empty State */}
        {conversations.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-blue-light-6 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-blue" />
            </div>
            <h2 className="text-xl font-bold text-dark mb-3">
              No messages yet
            </h2>
            <p className="text-body mb-6 max-w-md mx-auto">
              Start a conversation about your orders from the order details page, or reach out to our support team.
            </p>
            <Link
              href="/my-account?tab=orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white rounded-xl font-bold hover:bg-blue-dark transition-colors"
            >
              View My Orders
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          /* Conversations List */
          <div className="space-y-4">
            {conversations.map((conv) => {
              const hasUnread = conv._count.messages > 0;
              const lastMessage = conv.messages[0];
              const isFromSupport = lastMessage?.senderType === 'ADMIN';

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="block group"
                >
                  <div className="relative bg-white border-2 border-gray-2 rounded-2xl p-6 hover:border-blue hover:shadow-lg transition-all">
                    
                    {/* Unread Indicator */}
                    {hasUnread && (
                      <div className="absolute top-6 right-6">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue"></span>
                        </span>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-8">
                        <h3 className={`text-lg font-bold mb-1 truncate ${
                          hasUnread ? 'text-dark' : 'text-dark-5'
                        }`}>
                          {conv.subject}
                        </h3>
                        
                        {/* Order Badge */}
                        {conv.order && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-light-6 rounded-lg">
                              <Package className="w-3.5 h-3.5 text-blue-dark" />
                              <span className="text-xs font-bold text-blue-dark">
                                Order #{conv.order.id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              conv.order.status === 'DELIVERED' ? 'bg-green-light-6 text-green-dark' :
                              conv.order.status === 'SHIPPED' ? 'bg-purple-light-6 text-purple-dark' :
                              conv.order.status === 'PAID' ? 'bg-blue-light-6 text-blue-dark' :
                              'bg-yellow-light-6 text-yellow-dark'
                            }`}>
                              {conv.order.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Last Message Preview */}
                    {lastMessage && (
                      <div className="mb-3">
                        <p className={`text-sm line-clamp-2 ${
                          hasUnread ? 'text-dark font-medium' : 'text-body'
                        }`}>
                          {isFromSupport && (
                            <span className="inline-flex items-center gap-1 text-blue font-bold mr-2">
                              Support:
                            </span>
                          )}
                          {lastMessage.content}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-body">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(conv.lastMessageAt)}</span>
                      </div>

                      {hasUnread && (
                        <div className="flex items-center gap-2">
                          <span className="bg-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {conv._count.messages} new
                          </span>
                        </div>
                      )}

                      <div className="text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Help Text */}
        {conversations.length > 0 && (
          <div className="mt-8 p-4 bg-blue-light-6 rounded-xl border border-blue-light-4">
            <p className="text-sm text-blue-dark">
              <span className="font-bold">Need help?</span> You can start a new conversation from any order details page or contact our support team directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}