// app/admin/orders/OrderActions.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../../../../../../lib/order.action";

const ORDER_STATUSES = [
  'PENDING',
  'PROCESSING', 
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'PAID',
  'FAILED'
] as const;

type OrderStatus = typeof ORDER_STATUSES[number];

interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  user: {
    name: string | null;
    email: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    product: {
      title: string;
      price: number;
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
      toast.success(`Order status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <select
        value={order.status}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        disabled={loading}
        className="text-xs border rounded px-2 py-1 bg-white"
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <button
        onClick={() => setShowDetails(true)}
        className="text-blue-light hover:text-blue-dark text-xs px-2 py-1 border border-blue-light-3 rounded hover:bg-blue-light-4"
      >
        Details
      </button>

      {/* Order Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-dark bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-7">
                Order Details #{order.id.slice(-8)}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-3 hover:text-gray-5"
              >
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-7 mb-2">Customer Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm"><strong>Name:</strong> {order.user.name || 'Guest'}</p>
                <p className="text-sm"><strong>Email:</strong> {order.user.email}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-7 mb-2">Order Items</h4>
              <div className="space-y-2">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-1 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-7">{item.product.title}</p>
                      <p className="text-sm text-gray-3">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-7">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-3">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-7">Total Amount:</span>
                <span className="text-lg font-bold text-gray-7">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
  {/* Using your custom gray-7 color and custom-sm font size */}
  <span className="text-custom-sm font-medium text-gray-7">Status:</span>
  
  <span className={`px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider ${
    order.status === 'DELIVERED' 
      ? 'bg-green-light-6 text-green-dark' : 
    order.status === 'SHIPPED' 
      ? 'bg-orange/10 text-orange-dark' : 
    order.status === 'PROCESSING' 
      ? 'bg-blue-light-5 text-blue-dark' : 
    order.status === 'PENDING' 
      ? 'bg-yellow-light-2 text-yellow-dark' : 
      'bg-red-light-6 text-red-dark'
  }`}>
    {order.status}
  </span>
</div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full bg-gray-3 text-gray-7 px-4 py-2 rounded hover:bg-gray-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
