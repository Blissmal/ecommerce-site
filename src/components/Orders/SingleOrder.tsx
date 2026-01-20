import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
// Assuming you export your generated types
import { Order, OrderStatus } from "@/generated/prisma"; 

interface SingleOrderProps {
  orderItem: Order & { title?: string }; // Prisma Order doesn't have 'title' by default, usually derived from items
  smallView?: boolean;
}

const SingleOrder = ({ orderItem, smallView }: SingleOrderProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => setShowDetails(!showDetails);
  const toggleEdit = () => setShowEdit(!showEdit);

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  // Helper to map Prisma OrderStatus to Tailwind colors
  const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
      case "PAID":
        return "text-green bg-green-light-6";
      case "FAILED":
      case "CANCELLED":
        return "text-red bg-red-light-6";
      case "PROCESSING":
      case "SHIPPED":
        return "text-yellow bg-yellow-light-4";
      case "PENDING":
      default:
        return "text-dark bg-gray-2";
    }
  };

  const formattedDate = new Date(orderItem.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Change to KES if using M-Pesa predominantly
  }).format(orderItem.total);

  return (
    <>
      {/* Desktop View */}
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-red font-medium">
              #{orderItem.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{formattedDate}</p>
          </div>

          <div className="min-w-[128px]">
            <p className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] font-medium uppercase ${getStatusStyles(orderItem.status)}`}>
              {orderItem.status.toLowerCase()}
            </p>
          </div>

          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark truncate max-w-[200px]">
              {/* If Order doesn't have a title, you might show the first OrderItem name or Payment Method */}
              {orderItem.paymentMethod}
            </p>
          </div>

          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark font-bold">{formattedTotal}</p>
          </div>

          <div className="flex gap-5 items-center">
            <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
          </div>
        </div>
      )}

      {/* Mobile View */}
      {smallView && (
        <div className="block md:hidden border-b border-gray-3 last:border-b-0">
          <div className="py-4.5 px-7.5 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Order:</span> 
                #{orderItem.id.slice(-8).toUpperCase()}
              </p>
              <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
            </div>

            <div>
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Date:</span> {formattedDate}
              </p>
            </div>

            <div className="flex items-center">
              <span className="font-bold pr-2 text-custom-sm text-dark">Status:</span>
              <span className={`inline-block text-[10px] py-0.5 px-2.5 rounded-[30px] font-bold uppercase ${getStatusStyles(orderItem.status)}`}>
                {orderItem.status}
              </span>
            </div>

            <div>
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Method:</span> {orderItem.paymentMethod}
              </p>
            </div>

            <div>
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Total:</span> 
                <span className="text-dark font-bold">{formattedTotal}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={orderItem}
      />
    </>
  );
};

export default SingleOrder;