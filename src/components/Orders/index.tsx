import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";

const Orders = () => {
  const [orders, setOrders] = useState<any>([]);
  const [loading, setLoading] = useState(true); // 1. Add loading state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/order');
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error('Error fetching orders:', err.message);
      } finally {
        setLoading(false); // 2. Stop loading regardless of success/fail
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* Header Row - Only show if not loading and has orders */}
          {!loading && orders?.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex border-b border-gray-3">
              <div className="min-w-[111px]">
                <p className="text-custom-sm font-bold text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm font-bold text-dark">Date</p>
              </div>
              <div className="min-w-[128px]">
                <p className="text-custom-sm font-bold text-dark">Status</p>
              </div>
              <div className="min-w-[213px]">
                <p className="text-custom-sm font-bold text-dark">Payment Method</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm font-bold text-dark">Total</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-3 border-t-blue"></div>
              <p className="mt-4 text-custom-sm text-dark-4 font-medium">Loading your orders...</p>
            </div>
          ) : (
            <>
              {/* Desktop & Mobile List View */}
              {orders?.length > 0 ? (
                <>
                  {/* Desktop mapping */}
                  <div className="hidden md:block">
                    {orders.map((orderItem: any, key: number) => (
                      <SingleOrder key={key} orderItem={orderItem} smallView={false} />
                    ))}
                  </div>
                  
                  {/* Mobile mapping */}
                  <div className="md:hidden">
                    {orders.map((orderItem: any, key: number) => (
                      <SingleOrder key={key} orderItem={orderItem} smallView={true} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center">
                   <div className="mb-4 flex justify-center text-gray-4">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 8v8"/></svg>
                   </div>
                   <p className="text-custom-lg font-bold text-dark">No orders yet</p>
                   <p className="text-custom-sm text-dark-4">When you buy items, they will appear here.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;