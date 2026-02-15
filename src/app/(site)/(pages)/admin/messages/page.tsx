"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  MessageCircle, 
  User, 
  Clock, 
  AlertCircle,
  Package,
  Mail,
  Filter,
  Loader2,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

type Conversation = {
  id: string;
  subject: string;
  lastMessageAt: string;
  status: string;
  priority: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl?: string | null;
  };
  order?: { 
    id: string; 
    total: number;
    status: string;
  };
  messages: { 
    content: string; 
    createdAt: string;
    senderType: string;
  }[];
  _count: { messages: number };
};

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'urgent'>('all');

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

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'active') return conv.status === 'ACTIVE';
    if (filter === 'urgent') return conv.priority === 'URGENT' || conv.priority === 'HIGH';
    return true;
  });

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'ACTIVE').length,
    urgent: conversations.filter(c => c.priority === 'URGENT' || c.priority === 'HIGH').length,
    unread: conversations.reduce((sum, c) => sum + c._count.messages, 0),
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red bg-red-light-6 border-red-light-4';
      case 'HIGH': return 'text-orange bg-orange-light-6 border-orange-light-4';
      default: return 'text-blue bg-blue-light-6 border-blue-light-4';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-meta flex items-center justify-center font-euclid-circular-a">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue mx-auto mb-4 animate-spin" />
          <p className="text-body">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-meta p-4 sm:p-6 lg:p-7.5 font-euclid-circular-a">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Customer Messages</h1>
          <p className="text-body">Manage and respond to customer inquiries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-light-6 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-dark" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-dark mb-1">{stats.total}</h3>
            <p className="text-sm text-body">Total Conversations</p>
          </div>

          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-green-light-6 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-dark" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-dark mb-1">{stats.active}</h3>
            <p className="text-sm text-body">Active Chats</p>
          </div>

          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-red-light-6 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-dark" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-dark mb-1">{stats.urgent}</h3>
            <p className="text-sm text-body">High Priority</p>
          </div>

          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-purple-light-6 flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-dark" />
              </div>
              {stats.unread > 0 && (
                <span className="bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
                  {stats.unread}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-dark mb-1">{stats.unread}</h3>
            <p className="text-sm text-body">Unread Messages</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-dark-5" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue text-white shadow-md'
                  : 'bg-white text-dark hover:bg-gray-1 border border-gray-3'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green text-white shadow-md'
                  : 'bg-white text-dark hover:bg-gray-1 border border-gray-3'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'urgent'
                  ? 'bg-red text-white shadow-md'
                  : 'bg-white text-dark hover:bg-gray-1 border border-gray-3'
              }`}
            >
              Urgent ({stats.urgent})
            </button>
          </div>
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-12 text-center">
            <div className="w-16 h-16 bg-gray-1 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-4" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">No conversations found</h3>
            <p className="text-body">
              {filter === 'all' 
                ? 'No customer messages yet' 
                : `No ${filter} conversations at the moment`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conv) => {
              const hasUnread = conv._count.messages > 0;
              const lastMessage = conv.messages[0];

              return (
                <Link
                  key={conv.id}
                  href={`/admin/messages/${conv.id}`}
                  className="block group"
                >
                  <div className="bg-white border-2 border-gray-2 rounded-2xl p-6 hover:border-blue hover:shadow-xl transition-all">
                    
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Customer Avatar */}
                        <div className="relative shrink-0">
                          {conv.user.imageUrl ? (
                            <img
                              src={conv.user.imageUrl}
                              alt={conv.user.name || 'Customer'}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-light-6 flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-dark" />
                            </div>
                          )}
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-red border-2 border-white"></span>
                            </span>
                          )}
                        </div>

                        {/* Customer Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-dark truncate">
                              {conv.user.name || 'Customer'}
                            </h3>
                            {conv.priority !== 'NORMAL' && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getPriorityColor(conv.priority)}`}>
                                {conv.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-body mb-2">{conv.user.email}</p>
                          <p className="text-sm font-medium text-dark-5 mb-3">{conv.subject}</p>

                          {/* Order Info */}
                          {conv.order && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-light-6 rounded-lg">
                                <Package className="w-3.5 h-3.5 text-purple-dark" />
                                <span className="text-xs font-bold text-purple-dark">
                                  #{conv.order.id.slice(-8).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-dark">
                                KES {conv.order.total.toFixed(2)}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                conv.order.status === 'DELIVERED' ? 'bg-green-light-6 text-green-dark' :
                                conv.order.status === 'SHIPPED' ? 'bg-blue-light-6 text-blue-dark' :
                                'bg-yellow-light-6 text-yellow-dark'
                              }`}>
                                {conv.order.status}
                              </span>
                            </div>
                          )}

                          {/* Last Message */}
                          {lastMessage && (
                            <div className="p-3 bg-gray-1 rounded-lg">
                              <p className="text-sm text-dark line-clamp-2">
                                {lastMessage.senderType === 'ADMIN' ? (
                                  <span className="font-bold text-blue">You: </span>
                                ) : (
                                  <span className="font-bold text-dark">{conv.user.name || 'Customer'}: </span>
                                )}
                                {lastMessage.content}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {hasUnread && (
                          <span className="bg-red text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                            {conv._count.messages} new
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-body whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(conv.lastMessageAt)}
                        </div>
                        <div className="text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}