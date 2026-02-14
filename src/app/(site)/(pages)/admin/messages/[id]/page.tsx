"use client";

import { use, useEffect, useState, useRef } from "react";
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Message = {
  id: string;
  content: string;
  senderType: "USER" | "ADMIN";
  createdAt: string;
  isRead: boolean;
  sender: { 
    id: string;
    name: string | null; 
    imageUrl?: string | null;
  };
};

type Conversation = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    imageUrl?: string | null;
  };
  order?: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
  };
};

type MessageTemplate = {
  id: string;
  title: string;
  content: string;
  category: string | null;
};

export default function AdminChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchTemplates();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/message-templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
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
      setShowTemplates(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const useTemplate = (template: MessageTemplate) => {
    setNewMessage(template.content);
    setShowTemplates(false);
  };

  const updateConversationStatus = async (status: string) => {
    try {
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (conversation) {
        setConversation({ ...conversation, status });
      }
      setShowActions(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const updatePriority = async (priority: string) => {
    try {
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      
      if (conversation) {
        setConversation({ ...conversation, priority });
      }
      setShowActions(false);
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red text-white';
      case 'HIGH': return 'bg-orange text-white';
      case 'NORMAL': return 'bg-blue-light-5 text-blue-dark';
      default: return 'bg-gray-2 text-dark-5';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-light-6 text-green-dark border-green-light-4';
      case 'RESOLVED': return 'bg-blue-light-6 text-blue-dark border-blue-light-4';
      case 'CLOSED': return 'bg-gray-2 text-dark-5 border-gray-3';
      default: return 'bg-yellow-light-6 text-yellow-dark border-yellow-light-4';
    }
  };

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-meta">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-meta p-4 sm:p-6 font-euclid-circular-a">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/messages" 
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-dark">
                {conversation.subject}
              </h1>
              <p className="text-sm text-body mt-1">
                Started {new Date(conversation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Priority Badge */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getPriorityColor(conversation.priority)}`}>
              {conversation.priority}
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(conversation.status)}`}>
              {conversation.status}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-dark" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2 border border-gray-3 py-2 w-48 z-10">
                  <div className="px-3 py-2 text-xs font-bold text-dark-5 uppercase">
                    Change Status
                  </div>
                  <button
                    onClick={() => updateConversationStatus('ACTIVE')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-1 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-green" />
                    Mark Active
                  </button>
                  <button
                    onClick={() => updateConversationStatus('RESOLVED')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-1 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => updateConversationStatus('CLOSED')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-1 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-gray-5" />
                    Close Conversation
                  </button>

                  <div className="border-t border-gray-2 my-2"></div>
                  
                  <div className="px-3 py-2 text-xs font-bold text-dark-5 uppercase">
                    Priority
                  </div>
                  <button
                    onClick={() => updatePriority('LOW')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-1"
                  >
                    Low Priority
                  </button>
                  <button
                    onClick={() => updatePriority('NORMAL')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-1"
                  >
                    Normal Priority
                  </button>
                  <button
                    onClick={() => updatePriority('HIGH')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-1"
                  >
                    High Priority
                  </button>
                  <button
                    onClick={() => updatePriority('URGENT')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-1"
                  >
                    Urgent Priority
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Sidebar - Customer Info */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Customer Card */}
            <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-6">
              <div className="flex items-center gap-3 mb-4">
                {conversation.user.imageUrl ? (
                  <Image
                    src={conversation.user.imageUrl}
                    width={48}
                    height={48}
                    className="rounded-full"
                    alt={conversation.user.name || 'User'}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-light-5 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark truncate">
                    {conversation.user.name || 'Customer'}
                  </h3>
                  <p className="text-xs text-body">Customer</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-body mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-body">Email</p>
                    <p className="text-sm font-medium text-dark truncate">
                      {conversation.user.email}
                    </p>
                  </div>
                </div>

                {conversation.user.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-body mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-body">Phone</p>
                      <p className="text-sm font-medium text-dark">
                        {conversation.user.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-2">
                <Link
                  href={`/admin/users?search=${conversation.user.email}`}
                  className="text-sm font-medium text-blue hover:underline"
                >
                  View Customer Profile →
                </Link>
              </div>
            </div>

            {/* Order Card */}
            {conversation.order && (
              <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-blue" />
                  <h3 className="font-bold text-dark">Related Order</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-body mb-1">Order Number</p>
                    <p className="text-sm font-bold text-dark">
                      #{conversation.order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-body mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-green-dark">
                      KES {conversation.order.total.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-body mb-1">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      conversation.order.status === 'DELIVERED' ? 'bg-green-light-6 text-green-dark' :
                      conversation.order.status === 'SHIPPED' ? 'bg-blue-light-6 text-blue-dark' :
                      conversation.order.status === 'PAID' ? 'bg-purple-light-6 text-purple-dark' :
                      'bg-yellow-light-6 text-yellow-dark'
                    }`}>
                      {conversation.order.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-body mb-1">Order Date</p>
                    <p className="text-sm text-dark">
                      {new Date(conversation.order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-2">
                  <Link
                    href={`/admin/orders?id=${conversation.order.id}`}
                    className="text-sm font-medium text-blue hover:underline"
                  >
                    View Order Details →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-2 border border-gray-3 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
              
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-1 flex items-center justify-center mb-4">
                      <Zap className="w-8 h-8 text-gray-4" />
                    </div>
                    <p className="text-lg font-bold text-dark mb-2">No messages yet</p>
                    <p className="text-sm text-body">Start the conversation with the customer</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-start gap-2 max-w-[70%]">
                          {msg.senderType === 'USER' && (
                            <div className="w-8 h-8 rounded-full bg-blue-light-5 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue" />
                            </div>
                          )}
                          
                          <div>
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                msg.senderType === 'ADMIN'
                                  ? 'bg-blue text-white'
                                  : 'bg-gray-1 text-dark'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1 px-2">
                              <p className={`text-xs ${msg.senderType === 'ADMIN' ? 'text-blue-dark' : 'text-body'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              {msg.senderType === 'ADMIN' && (
                                <span className="text-xs text-body">
                                  {msg.isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>

                          {msg.senderType === 'ADMIN' && (
                            <div className="w-8 h-8 rounded-full bg-purple-light-6 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-purple-dark" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Templates Dropdown */}
              {showTemplates && templates.length > 0 && (
                <div className="border-t border-gray-2 bg-gray-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-dark">Quick Replies</p>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="text-xs text-body hover:text-dark"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => useTemplate(template)}
                        className="text-left p-3 bg-white rounded-lg border border-gray-3 hover:border-blue transition-colors"
                      >
                        <p className="text-sm font-bold text-dark mb-1">
                          {template.title}
                        </p>
                        <p className="text-xs text-body line-clamp-2">
                          {template.content}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-gray-3 p-4">
                {templates.length > 0 && !showTemplates && (
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="mb-3 text-sm font-medium text-blue hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-4 h-4" />
                    Use Quick Reply
                  </button>
                )}

                <form onSubmit={sendMessage} className="flex gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className="flex-1 px-4 py-3 border border-gray-3 rounded-xl focus:border-blue focus:outline-none resize-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-3 bg-blue text-white rounded-xl font-bold hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}