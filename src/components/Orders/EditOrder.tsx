import React, { useState } from "react";
import toast from "react-hot-toast";
import { Order, OrderStatus } from "@/generated/prisma";

interface EditOrderProps {
  order: Order;
  toggleModal: (status: boolean) => void;
}

const EditOrder = ({ order, toggleModal }: EditOrderProps) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentStatus(e.target.value as OrderStatus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      toast.success(`Order marked as ${currentStatus.toLowerCase()}`);
      toggleModal(false);
      // Optional: Refresh parent data here
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-10">
      <div className="mb-5 text-center">
        <h3 className="text-lg font-bold text-dark">Update Order Status</h3>
        <p className="text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <label className="pb-2 block text-custom-sm font-medium text-dark">
          Select New Status
        </label>
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          className="w-full rounded-[10px] border border-gray-3 bg-gray-1 text-dark py-3.5 px-5 text-custom-sm outline-none focus:border-blue"
          required
        >
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="FAILED">Failed</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full rounded-[10px] py-3.5 px-5 text-custom-sm font-medium text-white transition-all 
            ${loading ? "bg-gray-4" : "bg-blue hover:bg-blue-dark"}`}
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </form>
    </div>
  );
};

export default EditOrder;