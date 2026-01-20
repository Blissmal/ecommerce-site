import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
import Link from "next/link"; // 1. Import Link
import { Order, OrderStatus } from "@/generated/prisma"; 

interface SingleOrderProps {
  orderItem: Order & { title?: string }; 
  smallView?: boolean;
}

const SingleOrder = ({ orderItem, smallView }: SingleOrderProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent Link navigation when clicking buttons
    setShowDetails(!showDetails);
  };
  
  const toggleEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent Link navigation when clicking buttons
    setShowEdit(!showEdit);
  };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

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

  const formattedDate = new Date(orderItem.createdAt).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTotal = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES", 
  }).format(orderItem.total);

  return (
    <>
      {/* Desktop View */}
      {!smallView && (
        <Link 
          href={`/order/${orderItem.id}`}
          className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex hover:bg-gray-1 transition-colors group cursor-pointer"
        >
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-blue font-medium group-hover:underline">
              #{orderItem.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{formattedDate}</p>
          </div>

          <div className="min-w-[128px]">
            <p className={`inline-block text-[10px] py-0.5 px-2.5 rounded-[30px] font-bold uppercase border ${getStatusStyles(orderItem.status)}`}>
              {orderItem.status}
            </p>
          </div>

          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark truncate max-w-[200px]">
              {orderItem.paymentMethod}
            </p>
          </div>

          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark font-bold">{formattedTotal}</p>
          </div>

          <div className="flex gap-5 items-center">
            {/* We pass the stopped propagation handlers here */}
            {/* <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} /> */}
          </div>
        </Link>
      )}

      {/* Mobile View */}
      {smallView && (
        <Link 
          href={`/order/${orderItem.id}`}
          className="block md:hidden border-b border-gray-3 last:border-b-0 hover:bg-gray-1 active:bg-gray-2 transition-colors"
        >
          <div className="py-4.5 px-7.5 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Order:</span> 
                <span className="text-blue">#{orderItem.id.slice(-8).toUpperCase()}</span>
              </p>
              {/* <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} /> */}
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
                <span className="font-bold pr-2">Total:</span> 
                <span className="text-dark font-bold">{formattedTotal}</span>
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={orderItem}
      /> */}
    </>
  );
};

export default SingleOrder;