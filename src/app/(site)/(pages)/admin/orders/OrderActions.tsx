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
  const router = useRouter();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Status Selector with Loading State */}
      <div className="relative flex items-center">
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={loading}
          className="text-custom-xs font-bold border border-gray-3 rounded-lg px-3 py-1.5 bg-white text-dark focus:ring-2 focus:ring-blue/20 outline-none disabled:opacity-50 appearance-none pr-8 cursor-pointer"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {loading ? (
          <div className="absolute right-2 pointer-events-none">
            <svg className="animate-spin h-3 w-3 text-blue" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="absolute right-2 pointer-events-none text-gray-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Step 19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowDetails(true)}
        className="text-blue hover:text-blue-dark text-custom-xs font-bold px-3 py-1.5 border border-blue/20 rounded-lg hover:bg-blue-light-6 transition-colors"
      >
        View Details
      </button>

      {/* Order Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-2 flex items-center justify-between bg-gray-1">
              <div>
                <h3 className="text-heading-6 font-bold text-dark">
                  Order Details
                </h3>
                <p className="text-custom-xs text-body font-medium">#{order.id.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-2 text-dark transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-custom-sm font-bold text-dark-4 uppercase tracking-wider mb-3">Customer Info</h4>
                  <div className="space-y-1">
                    <p className="text-custom-sm font-bold text-dark">{order.billingName || order.user.name}</p>
                    <p className="text-custom-sm text-body">{order.billingEmail || order.user.email}</p>
                    <p className="text-custom-sm text-body">{order.phoneNumber || "No phone provided"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-custom-sm font-bold text-dark-4 uppercase tracking-wider mb-3">Shipping Address</h4>
                  <p className="text-custom-sm text-body leading-relaxed bg-meta p-3 rounded-xl border border-gray-3">
                    {order.billingAddress || "No address provided during checkout."}
                  </p>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h4 className="text-custom-sm font-bold text-dark-4 uppercase tracking-wider mb-3">Ordered Items</h4>
                <div className="space-y-3">
                  {order.orderItems.map((item) => {
                    const variant = item.variantSnapshot;
                    return (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-gray-3 rounded-xl">
                        <div className="flex flex-col gap-1">
                          <span className="text-custom-sm font-bold text-dark">{item.product.title}</span>
                          {variant && (
                            <div className="flex flex-wrap gap-2">
                              {variant.color && <span className="text-[10px] font-bold bg-gray-2 px-2 py-0.5 rounded text-dark-5 uppercase">{variant.color}</span>}
                              {variant.size && <span className="text-[10px] font-bold bg-gray-2 px-2 py-0.5 rounded text-dark-5 uppercase">{variant.size}</span>}
                              {variant.storage && <span className="text-[10px] font-bold bg-gray-2 px-2 py-0.5 rounded text-dark-5 uppercase">{variant.storage}</span>}
                            </div>
                          )}
                          <span className="text-custom-xs text-body">Quantity: <span className="font-bold">{item.quantity}</span></span>
                        </div>
                        <div className="text-right">
                          <p className="text-custom-sm font-bold text-dark">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-2xs text-body font-medium">${item.price.toFixed(2)} / unit</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-gray-1 p-5 rounded-2xl border border-gray-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-custom-sm font-medium text-dark-5">Payment Method</span>
                  <span className="text-custom-sm font-bold text-dark uppercase tracking-widest">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-3">
                  <span className="text-heading-6 font-bold text-dark">Total Amount</span>
                  <span className="text-heading-6 font-bold text-blue">${order.total.toFixed(2)}</span>
                </div>
                {order.orderNotes && (
                  <div className="mt-4 pt-4 border-t border-gray-3">
                    <p className="text-2xs font-bold text-dark-4 uppercase mb-1">Customer Note:</p>
                    <p className="text-custom-xs text-body italic bg-white p-2 rounded-lg border border-gray-2">"{order.orderNotes}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-2 bg-gray-1">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full bg-dark text-white font-bold py-3 rounded-xl hover:bg-dark-2 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}