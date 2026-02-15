"use client";

import { use, useEffect, useState, useRef } from "react";
import { Send, Paperclip, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Message = {
  id: string;
  content: string;
  senderType: string;
  createdAt: string;
  sender: { name: string; imageUrl?: string };
  attachments: any[];
};

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      const data = await res.json();
      setMessages(data.messages);
      setConversation(data.conversation);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: id,
          content: newMessage,
        }),
      });

      const { message } = await res.json();
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/messages" className="text-blue hover:text-blue-dark">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-dark">
              {conversation?.subject || 'Chat'}
            </h1>
            {conversation?.order && (
              <p className="text-sm text-gray-5">
                Order #{conversation.order.id.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-gray-1 rounded-xl p-6 mb-6 h-[500px] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  msg.senderType === 'USER'
                    ? 'bg-blue text-white'
                    : 'bg-white text-dark'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-3 rounded-xl focus:border-blue focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-blue text-white rounded-xl font-bold hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}