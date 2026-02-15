import React from "react";
import { Order, OrderItem, Product } from "@prisma/client";

// Defining the expected extended Order type from Prisma
type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Product;
  })[];
};

const OrderDetails = ({ orderItem }: { orderItem: OrderWithItems }) => {
  return (
    <div className="w-full max-h-[60vh] overflow-y-auto custom-scrollbar px-4 sm:px-7.5">
      <div className="mb-6 border-b border-gray-3 pb-4">
        <h3 className="text-lg font-bold text-dark">Order Items</h3>
        <p className="text-sm text-gray-500">Transaction ID: {orderItem.id}</p>
      </div>

      <div className="flex flex-col gap-4">
        {orderItem.orderItems?.map((item, index) => {
          // Parsing the variant snapshot for display
          const snapshot = item.variantSnapshot as any;

          return (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-2 last:border-0">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-3">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-dark">
                    <h4 className="text-custom-sm font-bold">{item.product.title}</h4>
                    <p className="ml-4 text-custom-sm">${item.price.toFixed(2)}</p>
                  </div>
                  {snapshot && (
                    <p className="mt-1 text-xs text-gray-500">
                      {snapshot.color && `Color: ${snapshot.color}`}
                      {snapshot.size && ` | Size: ${snapshot.size}`}
                      {snapshot.storage && ` | Storage: ${snapshot.storage}`}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <p className="text-gray-500">Qty {item.quantity}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-2 bg-gray-1 p-4 rounded-lg">
        <div className="flex justify-between text-custom-sm">
          <span className="text-dark">Payment Method:</span>
          <span className="font-medium text-dark">{orderItem.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-gray-3 pt-2 mt-2">
          <span className="text-dark">Total:</span>
          <span className="text-red">${orderItem.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;