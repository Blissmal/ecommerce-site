// app/admin/orders/OrderActions.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../../../../../../lib/order.action";

const ORDER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'PAID',
  'FAILED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
] as const;

type OrderStatus = typeof ORDER_STATUSES[number];

interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  paymentMethod: 'MPESA' | 'BANK';
  phoneNumber?: string | null;
  billingName?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
  orderNotes?: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    variantSnapshot?: any;
    product: {
      title: string;
    };
  }>;
}

export default function OrderActions({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // New state for confirmation modal
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    pendingStatus: OrderStatus | null;
  }>({
    isOpen: false,
    pendingStatus: null,
  });

  const router = useRouter();

  // 1. Trigger the confirmation modal
  const handleStatusChange = (newStatus: OrderStatus) => {
    setConfirmationState({
      isOpen: true,
      pendingStatus: newStatus,
    });
  };

  // 2. Actually execute the update after confirmation
  const confirmStatusUpdate = async () => {
    if (!confirmationState.pendingStatus) return;
    
    const newStatus = confirmationState.pendingStatus;
    setLoading(true);
    
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      router.refresh();
      // Close confirmation modal
      setConfirmationState({ isOpen: false, pendingStatus: null });
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get description for the confirmation modal
  const getStatusDescription = (status: OrderStatus | null) => {
    switch (status) {
      case 'PROCESSING':
        return "You are about to approve this payment. This will mark the order as Processing and allow fulfillment to begin.";
      case 'SHIPPED':
        return "You are marking this order as Shipped. Ensure the package has been handed to the courier.";
      case 'DELIVERED':
        return "You are confirming this order has been received by the customer. This completes the order lifecycle.";
      case 'CANCELLED':
        return "Are you sure? This will cancel the order and cannot be undone.";
      default:
        return `Are you sure you want to change the status to ${status}?`;
    }
  };

  // Quick action buttons based on current status
  const getQuickActions = () => {
    switch (order.status) {
      case 'PAID':
        return (
          <button
            onClick={() => handleStatusChange('PROCESSING')}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue to-blue-dark text-white text-2xs font-bold px-3 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approve & Process
          </button>
        );
      case 'PROCESSING':
        return (
          <button
            onClick={() => handleStatusChange('SHIPPED')}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-light-2 to-blue text-white text-2xs font-bold px-3 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark as Shipped
          </button>
        );
      case 'SHIPPED':
        return (
          <button
            onClick={() => handleStatusChange('DELIVERED')}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-green to-green-dark text-white text-2xs font-bold px-3 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirm Delivery
          </button>
        );
      default:
        return null;
    }
  };

  // Calculate time since order creation
  const getTimeSinceCreated = () => {
    const now = new Date();
    const created = new Date(order.createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInHours < 1) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  // Show urgency indicator for PAID orders
  const showUrgencyIndicator = order.status === 'PAID';
  const timeSince = getTimeSinceCreated();

  return (
    <div className="flex items-center gap-3">
      {/* Quick Action Button */}
      {getQuickActions()}

      {/* View Details Button */}
      <button
        onClick={() => setShowDetails(true)}
        className="relative text-blue hover:text-blue-dark text-2xs font-bold px-3 py-2 border border-blue/20 rounded-lg hover:bg-blue-light-3 transition-colors"
      >
        View Details
        {showUrgencyIndicator && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red"></span>
          </span>
        )}
      </button>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmationState.isOpen && (
        <div className="fixed inset-0 bg-dark/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          {/* Changed max-w-sm to max-w-md to allow more width for the text */}
          <div className="bg-white rounded-xl shadow-2 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-light-6 mb-4">
                <svg className="h-6 w-6 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">
                Confirm Action
              </h3>
              {/* Added 'px-2' for internal padding and 'leading-relaxed' for readability */}
              <p className="text-sm text-body mb-6 px-2 leading-relaxed whitespace-normal break-words">
                {getStatusDescription(confirmationState.pendingStatus)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmationState({ isOpen: false, pendingStatus: null })}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-1 border border-gray-3 text-dark font-bold rounded-lg hover:bg-gray-2 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue text-white font-bold rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-2 flex items-center justify-between bg-gradient-to-r from-gray-1 to-white">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-heading-6 font-bold text-dark">
                    Order Details
                  </h3>
                  {showUrgencyIndicator && (
                    <span className="flex items-center gap-1.5 bg-red-light-6 text-red-dark px-3 py-1 rounded-full border border-red-light-4">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                      </span>
                      <span className="text-2xs font-bold uppercase">Action Required</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-custom-xs text-body font-medium">#{order.id.toUpperCase()}</p>
                  <span className="text-custom-xs text-body">•</span>
                  <p className="text-custom-xs text-body font-medium">{timeSince}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-2 text-dark transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Action Required Alert for PAID orders */}
              {order.status === 'PAID' && (
                <div className="bg-gradient-to-r from-red-light-6 to-orange-light-6 border-2 border-red-light-4 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-red-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-custom-sm font-bold text-red-dark mb-1">Payment Received - Action Required</h4>
                      <p className="text-custom-xs text-dark-5 mb-3">This order has been paid {timeSince}. Please review and approve to begin processing.</p>
                      <button
                        onClick={() => handleStatusChange('PROCESSING')}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue to-blue-dark text-white text-2xs font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                      >
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         Approve & Start Processing
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Workflow Actions for other statuses */}
              {(order.status === 'PROCESSING' || order.status === 'SHIPPED') && (
                <div className="bg-blue-light-6 border border-blue-light-4 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-custom-sm font-bold text-blue-dark mb-1">
                        {order.status === 'PROCESSING' ? 'Ready to Ship?' : 'Confirm Delivery?'}
                      </h4>
                      <p className="text-custom-xs text-dark-5">
                        {order.status === 'PROCESSING' 
                          ? 'Mark this order as shipped once dispatched to courier.' 
                          : 'Confirm delivery once customer receives the order.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStatusChange(order.status === 'PROCESSING' ? 'SHIPPED' : 'DELIVERED')}
                      disabled={loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple to-purple-dark text-white text-2xs font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {order.status === 'PROCESSING' ? 'Mark Shipped' : 'Confirm Delivered'}
                    </button>
                  </div>
                </div>
              )}

              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-1 rounded-xl p-4 border border-gray-3">
                  <h4 className="text-2xs font-bold text-dark-4 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Info
                  </h4>
                  <div className="space-y-2">
                    <p className="text-custom-sm font-bold text-dark">{order.billingName || order.user.name}</p>
                    <p className="text-custom-xs text-body flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {order.billingEmail || order.user.email}
                    </p>
                    <p className="text-custom-xs text-body flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {order.phoneNumber || "No phone provided"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-1 rounded-xl p-4 border border-gray-3">
                  <h4 className="text-2xs font-bold text-dark-4 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Shipping Address
                  </h4>
                  <p className="text-custom-xs text-body leading-relaxed">
                    {order.billingAddress || "No address provided during checkout."}
                  </p>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h4 className="text-custom-sm font-bold text-dark mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Ordered Items ({order.orderItems.length})
                </h4>
                <div className="space-y-3">
                  {order.orderItems.map((item) => {
                    const variant = item.variantSnapshot;
                    return (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-gray-3 rounded-xl hover:border-blue transition-colors">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-custom-sm font-bold text-dark">{item.product.title}</span>
                          {variant && (
                            <div className="flex flex-wrap gap-2">
                              {variant.color && <span className="text-[10px] font-bold bg-gray-2 px-2 py-0.5 rounded text-dark-5 uppercase">{variant.color}</span>}
                              {variant.size && <span className="text-[10px] font-bold bg-gray-2 px-2 py-0.5 rounded text-dark-5 uppercase">{variant.size}</span>}
                              {variant.storage && <span className="text-[10px] font-bold bg-gray-2 px-2 py-0.5 rounded text-dark-5 uppercase">{variant.storage}</span>}
                            </div>
                          )}
                          <span className="text-custom-xs text-body">Quantity: <span className="font-bold text-dark">{item.quantity}</span></span>
                        </div>
                        <div className="text-right">
                          <p className="text-custom-sm font-bold text-dark">KES {(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-2xs text-body font-medium">KES {item.price.toFixed(2)} / unit</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-gradient-to-br from-gray-1 to-white p-5 rounded-2xl border border-gray-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-custom-sm font-medium text-dark-5">Payment Method</span>
                  <span className="text-custom-sm font-bold text-dark uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-gray-3">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-3">
                  <span className="text-heading-6 font-bold text-dark">Total Amount</span>
                  <span className="text-heading-6 font-bold text-blue">KES {order.total.toFixed(2)}</span>
                </div>
                {order.orderNotes && (
                  <div className="mt-4 pt-4 border-t border-gray-3">
                    <p className="text-2xs font-bold text-dark-4 uppercase mb-2 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Customer Note
                    </p>
                    <p className="text-custom-xs text-body italic bg-white p-3 rounded-lg border border-gray-2">"{order.orderNotes}"</p>
                  </div>
                )}
              </div>

              {/* Status History Timeline */}
              <div className="bg-gray-1 p-4 rounded-xl border border-gray-3">
                <h4 className="text-2xs font-bold text-dark-4 uppercase tracking-wider mb-3">Current Status</h4>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1.5 text-2xs font-bold rounded-full uppercase tracking-wider ${
                    order.status === 'PAID' ? 'bg-green-light-6 text-green-dark border border-green-light-4' :
                    order.status === 'PROCESSING' ? 'bg-blue-light-5 text-blue-dark border border-blue-light-4' :
                    order.status === 'SHIPPED' ? 'bg-yellow-light-1 text-orange-dark border border-yellow-light-2' :
                    order.status === 'DELIVERED' ? 'bg-green-light-6 text-green-dark border border-green-light-4' :
                    order.status === 'FAILED' ? 'bg-red-light-6 text-red-dark border border-red-light-4' :
                    order.status === 'CANCELLED' ? 'bg-red-light-6 text-red-dark border border-red-light-4' :
                    order.status === 'PENDING' ? 'bg-yellow-light-2 text-yellow-dark border border-yellow-light-3' :
                    'bg-gray-1 text-gray-6'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-custom-xs text-body">• {timeSince}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-2 bg-gray-1 flex gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 bg-white text-dark font-bold py-3 rounded-xl hover:bg-gray-2 transition-all border border-gray-3"
              >
                Close
              </button>
              {order.status === 'PAID' && (
                <button
                  onClick={() => handleStatusChange('PROCESSING')}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue to-blue-dark text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Approve Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}