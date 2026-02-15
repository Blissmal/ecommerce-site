"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function MessageOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const { conversation } = await res.json();
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-blue text-white rounded-xl font-bold hover:bg-blue-dark transition-colors disabled:opacity-50"
    >
      <MessageCircle className="w-5 h-5" />
      {loading ? 'Starting...' : 'Contact support'}
    </button>
  );
}