// app/admin/orders/BatchOperations.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { batchUpdateOrderStatus } from "../../../../../../lib/order.action";

type OrderStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface BatchOperationsProps {
  selectedOrders: Set<string>;
  onClearSelection: () => void;
  totalOrders: number;
}

const STATUS_OPTIONS: { 
  value: OrderStatus; 
  label: string; 
  icon: React.ReactNode; 
  color: string; 
  description: string 
}[] = [
  {
    value: 'PROCESSING',
    label: 'Processing',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: 'from-blue to-blue-dark',
    description: 'Mark orders as being processed'
  },
  {
    value: 'SHIPPED',
    label: 'Shipped',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
    color: 'from-purple to-purple-dark',
    description: 'Mark orders as shipped to customers'
  },
  {
    value: 'DELIVERED',
    label: 'Delivered',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    color: 'from-green to-green-dark',
    description: 'Confirm orders have been delivered'
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
    color: 'from-red to-red-dark',
    description: 'Cancel selected orders'
  },
];

export default function BatchOperations({ selectedOrders, onClearSelection, totalOrders }: BatchOperationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    status: OrderStatus | null;
    action: 'update' | null;
  }>({
    isOpen: false,
    status: null,
    action: null,
  });
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    isProcessing: boolean;
  }>({
    current: 0,
    total: 0,
    isProcessing: false,
  });

  const router = useRouter();

  const handleBatchUpdate = (status: OrderStatus) => {
    setConfirmationModal({
      isOpen: true,
      status,
      action: 'update',
    });
  };

  const confirmBatchUpdate = async () => {
    if (!confirmationModal.status) return;

    const orderIds = Array.from(selectedOrders);
    setLoading(true);
    setProgress({
      current: 0,
      total: orderIds.length,
      isProcessing: true,
    });

    try {
      // Process in batches of 10
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < orderIds.length; i += batchSize) {
        batches.push(orderIds.slice(i, i + batchSize));
      }

      let processed = 0;
      for (const batch of batches) {
        await batchUpdateOrderStatus(batch, confirmationModal.status);
        processed += batch.length;
        setProgress(prev => ({ ...prev, current: processed }));
      }

      toast.success(`Successfully updated ${orderIds.length} order${orderIds.length > 1 ? 's' : ''} to ${confirmationModal.status}`);
      router.refresh();
      onClearSelection();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update orders. Some orders may have been updated.");
      console.error("Batch update error:", error);
    } finally {
      setLoading(false);
      setProgress({
        current: 0,
        total: 0,
        isProcessing: false,
      });
      setConfirmationModal({
        isOpen: false,
        status: null,
        action: null,
      });
    }
  };

  if (selectedOrders.size === 0) return null;

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
        <div className="bg-blue-dark text-white rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
          <div className="px-6 py-4 flex items-center gap-6">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold">
                  {selectedOrders.size} {selectedOrders.size === 1 ? 'order' : 'orders'} selected
                </p>
                <p className="text-xs opacity-80">
                  {((selectedOrders.size / totalOrders) * 100).toFixed(0)}% of total orders
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-white/20" />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl transition-all border border-white/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Batch Actions
                <svg 
                  className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                onClick={onClearSelection}
                className="flex items-center gap-2 bg-white/10 hover:bg-red/80 text-white font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            </div>
          </div>

          {/* Batch Actions Dropdown */}
          {isOpen && (
            <div className="border-t border-white/20 p-4 bg-white/5 backdrop-blur-md rounded-b-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleBatchUpdate(option.value)}
                    disabled={loading}
                    className={`
                      group relative overflow-hidden
                      bg-white hover:shadow-xl
                      text-dark font-bold px-4 py-3 rounded-xl
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                      border-2 border-transparent hover:border-white
                    `}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative flex flex-col items-center gap-2">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-xs">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/60 mt-3 text-center">
                Select an action to apply to all {selectedOrders.size} selected orders
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-2">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                  STATUS_OPTIONS.find(o => o.value === confirmationModal.status)?.color
                } flex items-center justify-center text-white text-2xl`}>
                  {STATUS_OPTIONS.find(o => o.value === confirmationModal.status)?.icon}
                </div>
                <div>
                  <h3 className="text-heading-6 font-bold text-dark">Confirm Batch Update</h3>
                  <p className="text-custom-xs text-body">This action will affect multiple orders</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-yellow-light-2 border border-yellow-light-3 rounded-xl p-4 mb-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-dark flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-custom-sm font-bold text-yellow-dark mb-1">
                      You are about to update {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''}
                    </p>
                    <p className="text-custom-xs text-yellow-dark/80">
                      {STATUS_OPTIONS.find(o => o.value === confirmationModal.status)?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-1 rounded-lg">
                  <span className="text-custom-sm text-body">Selected Orders:</span>
                  <span className="text-custom-sm font-bold text-dark">{selectedOrders.size}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-1 rounded-lg">
                  <span className="text-custom-sm text-body">New Status:</span>
                  <span className={`text-custom-sm font-bold px-3 py-1 rounded-full bg-gradient-to-r ${
                    STATUS_OPTIONS.find(o => o.value === confirmationModal.status)?.color
                  } text-white`}>
                    {confirmationModal.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {progress.isProcessing && (
                <div className="mt-4">
                  <div className="flex justify-between text-custom-xs text-body mb-2">
                    <span>Processing...</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="h-2 bg-gray-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue to-blue-dark transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-2 bg-gray-1 flex gap-3">
              <button
                onClick={() => setConfirmationModal({ isOpen: false, status: null, action: null })}
                disabled={loading}
                className="flex-1 bg-white text-dark font-bold py-3 rounded-xl hover:bg-gray-2 transition-all border border-gray-3 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBatchUpdate}
                disabled={loading}
                className={`flex-1 bg-gradient-to-r ${
                  STATUS_OPTIONS.find(o => o.value === confirmationModal.status)?.color
                } text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Update
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}