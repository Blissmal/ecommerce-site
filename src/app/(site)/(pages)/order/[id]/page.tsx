import React from "react";
import { notFound } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  XCircle, 
  CreditCard, 
  MapPin, 
  FileText,
  ArrowLeft,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../../../../../lib/prisma";

const getStatusConfig = (status: string) => {
  const configs: Record<string, { icon: any; color: string; label: string; step: number }> = {
    "PENDING": { icon: Clock, color: "text-amber-500 bg-amber-50 border-amber-100", label: "Awaiting Payment", step: 1 },
    "PAID": { icon: CheckCircle2, color: "text-blue bg-blue/5 border-blue/10", label: "Payment Confirmed", step: 2 },
    "PROCESSING": { icon: Package, color: "text-blue bg-blue/5 border-blue/10", label: "Preparing Items", step: 3 },
    "SHIPPED": { icon: Truck, color: "text-indigo-600 bg-indigo-50 border-indigo-100", label: "In Transit", step: 4 },
    "DELIVERED": { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100", label: "Delivered", step: 5 },
    "CANCELLED": { icon: XCircle, color: "text-red-600 bg-red-50 border-red-100", label: "Order Cancelled", step: 0 },
    "FAILED": { icon: AlertCircle, color: "text-red-600 bg-red-50 border-red-100", label: "Payment Failed", step: 0 },
  };
  return configs[status] || configs["PENDING"];
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: { include: { product: true, variant: true } },
      user: true
    }
  });

  if (!order) notFound();

  const config = getStatusConfig(order.status);
  const isTerminal = ["CANCELLED", "FAILED", "DELIVERED"].includes(order.status);
  const isCancelled = ["CANCELLED", "FAILED"].includes(order.status);

  return (
    <div className="min-h-screen bg-white font-euclid-circular-a pt-20 pb-24">
      {/* Visual Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue/5 rounded-full blur-[120px] -z-10 opacity-50" />
      
      <div className="max-w-5xl mx-auto px-6 pt-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-6 mb-10">
          <Link href="/my-account?tab=orders" className="flex items-center gap-2 text-sm font-bold text-dark-5 hover:text-blue transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            BACK TO ORDERS
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-dark tracking-tight">Order <span className="text-blue">#{order.id.slice(-8).toUpperCase()}</span></h1>
              </div>
              <p className="text-dark-5 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString('en-KE', { dateStyle: 'long' })}</p>
            </div>
            
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border ${config.color} font-bold text-sm shadow-sm`}>
              <config.icon className="w-5 h-5" />
              {config.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: Order Items */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Logic: Only show Progress Tracker if NOT cancelled */}
            {!isCancelled && (
              <div className="bg-gray-1 border border-gray-2 rounded-[2rem] p-8">
                <div className="flex justify-between relative">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${config.step >= s ? 'bg-blue border-blue text-white' : 'bg-white border-gray-2 text-gray-300'}`}>
                      <span className="text-xs font-bold">{s}</span>
                    </div>
                  ))}
                  <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-2 -z-0" />
                  <div className="absolute top-5 left-0 h-[2px] bg-blue transition-all duration-700 -z-0" style={{ width: `${((config.step - 1) / 4) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-4">
                  <span className="text-[10px] font-black text-dark tracking-widest uppercase">Placed</span>
                  <span className="text-[10px] font-black text-dark tracking-widest uppercase">Paid</span>
                  <span className="text-[10px] font-black text-dark tracking-widest uppercase">Packed</span>
                  <span className="text-[10px] font-black text-dark tracking-widest uppercase">Shipped</span>
                  <span className="text-[10px] font-black text-dark tracking-widest uppercase">Arrived</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-2 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-gray-1 bg-gray-50/50">
                <h3 className="font-black text-dark text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue" /> Items in your package
                </h3>
              </div>
              <div className="divide-y divide-gray-1">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="p-8 flex gap-6 hover:bg-gray-50/50 transition-colors">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-1 border border-gray-2 flex-shrink-0">
                      <Image src={item.product.imageUrl} alt={item.product.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 py-1">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold text-dark text-lg">{item.product.title}</h4>
                        <span className="font-black text-dark text-lg">KES {item.price.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.variant?.color && <span className="px-2 py-1 bg-gray-1 border border-gray-2 rounded-md text-[10px] font-bold text-dark-5 uppercase">{item.variant.color}</span>}
                        {item.variant?.storage && <span className="px-2 py-1 bg-gray-1 border border-gray-2 rounded-md text-[10px] font-bold text-dark-5 uppercase">{item.variant.storage}</span>}
                        {item.variant?.size && <span className="px-2 py-1 bg-gray-1 border border-gray-2 rounded-md text-[10px] font-bold text-dark-5 uppercase">{item.variant.size}</span>}
                      </div>
                      <p className="text-sm font-bold text-blue">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-dark text-white flex justify-between items-center">
                {/* Total Section */}
<div>
  <p className={`text-[10px] font-bold uppercase tracking-widest ${
    order.status === 'PAID' ? 'text-green' : 
    (order.status === 'FAILED' || order.status === 'CANCELLED') ? 'text-red' : 
    'text-dark-4'
  }`}>
    {order.status === 'PAID' || order.status === 'DELIVERED' 
      ? "Total Amount Paid" 
      : order.status === 'FAILED' || order.status === 'CANCELLED'
      ? "Total Amount (Unpaid)"
      : "Total Amount Due"
    }
  </p>
  <p className="text-custom-2xl font-black text-white">
    KES {order.total.toLocaleString()}
  </p>
</div>
                {order.paymentMethod && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</p>
                    <p className="text-sm font-bold">{order.paymentMethod}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Logic */}
          <div className="space-y-6">
            
            {/* Shipping Logic: Only show Address if NOT cancelled */}
            {!isCancelled ? (
              <div className="bg-white rounded-3xl border border-gray-2 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <MapPin className="w-12 h-12" />
                </div>
                <h3 className="font-black text-dark text-xs uppercase tracking-[0.2em] mb-6">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-dark-5 uppercase tracking-widest mb-1">Recipient</p>
                    <p className="font-bold text-dark">{order.billingName || order.user.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-dark-5 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm text-dark-5 leading-relaxed">{order.billingAddress || "Pickup Point / Not Specified"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-dark-5 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm text-dark-5 font-bold">{order.phoneNumber}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Cancellation Notice */
              <div className="bg-red-50 border border-red-100 rounded-3xl p-8">
                <h3 className="font-black text-red-600 text-xs uppercase tracking-[0.2em] mb-4">Shipping Terminated</h3>
                <p className="text-sm text-red-700 leading-relaxed mb-6">
                  This order was {order.status.toLowerCase()}. No shipping information is available as the transaction did not complete.
                </p>
                <Link href="/shop-with-sidebar" className="block w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-sm text-center hover:bg-red-700 transition-all">
                  Re-order Items
                </Link>
              </div>
            )}

            {/* Support Actions */}
            <div className="bg-blue/5 rounded-3xl p-8 border border-blue/10">
              <h3 className="font-black text-blue text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Need Assistance?
              </h3>
              <p className="text-sm text-blue/80 leading-relaxed mb-6">
                Having issues with your order or payment? Our 24/7 support team is here to help.
              </p>
              <div className="space-y-3">
                <button className="w-full py-4 bg-white text-dark border border-blue/10 rounded-2xl font-bold text-sm hover:bg-white/50 transition-all flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" /> Download Invoice
                </button>
                <button className="w-full py-4 bg-blue text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-blue/20 transition-all">
                  Contact Support
                </button>
              </div>
            </div>

            {order.orderNotes && (
              <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                 <p className="text-[10px] font-bold text-dark-5 uppercase tracking-widest not-italic mb-1">Your Note</p>
                 <span className="text-sm text-gray-500">"{order.orderNotes}"</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}