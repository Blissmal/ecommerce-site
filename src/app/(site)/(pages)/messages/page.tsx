"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Clock } from "lucide-react";

type Conversation = {
  id: string;
  subject: string;
  lastMessageAt: string;
  status: string;
  order?: { id: string; status: string };
  messages: { content: string; createdAt: string }[];
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
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <h1 className="text-3xl font-bold text-dark mb-8">My Messages</h1>

        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-4 mx-auto mb-4" />
            <p className="text-gray-5 text-lg">No messages yet</p>
            <p className="text-gray-4 mt-2">Start a conversation about your orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block p-6 bg-white border border-gray-2 rounded-xl hover:border-blue transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-dark">{conv.subject}</h3>
                  {conv._count.messages > 0 && (
                    <span className="bg-blue text-white text-xs px-2 py-1 rounded-full">
                      {conv._count.messages}
                    </span>
                  )}
                </div>

                {conv.order && (
                  <p className="text-sm text-gray-5 mb-2">
                    Order #{conv.order.id.slice(-8).toUpperCase()} • {conv.order.status}
                  </p>
                )}

                {conv.messages[0] && (
                  <p className="text-sm text-gray-4 line-clamp-1">
                    {conv.messages[0].content}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-4">
                  <Clock className="w-3 h-3" />
                  {new Date(conv.lastMessageAt).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}