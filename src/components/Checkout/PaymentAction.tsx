"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Loader2, Smartphone, RefreshCw, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PaymentActionProps {
  orderId: string;
  amount: number;
  initialPhoneNumber: string;
}

export default function PaymentAction({ orderId, amount, initialPhoneNumber }: PaymentActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [phone, setPhone] = useState(initialPhoneNumber);
  const router = useRouter();

  const handleRepay = async () => {
    setIsLoading(true);
    setStatusText("Sending M-Pesa prompt...");

    try {
      const response = await fetch("/api/checkout/repay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phoneNumber: phone }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Initiation failed");
      }

      toast.success("STK Push Sent!");
      setStatusText("Please enter your PIN on your phone...");
      
      // Start Polling just like the Checkout Page
      pollStatus(data.checkoutRequestID);

    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
      setStatusText("");
    }
  };

  const pollStatus = async (checkoutRequestID: string) => {
    let attempts = 0;
    const maxAttempts = 15; // 2.5 minutes

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/mpesa/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutRequestID }),
        });

        const data = await res.json();

        if (data.status === "PAID") {
          clearInterval(interval);
          setStatusText("Payment Received!");
          toast.success("Order Paid Successfully!");
          setTimeout(() => router.refresh(), 2000);
        } 
        else if (data.status === "FAILED") {
          clearInterval(interval);
          setIsLoading(false);
          setStatusText("Payment failed. Try again.");
          toast.error("Payment was declined.");
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsLoading(false);
          setStatusText("Verification timed out.");
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 10000); // 10 seconds
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl -z-10" />

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-dark uppercase tracking-tight">Complete Payment</h3>
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Action Required</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-dark-5 uppercase">Amount Due</span>
            <span className="text-lg font-black text-dark">KES {amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-dark-5 uppercase ml-1">M-Pesa Number</label>
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-4" />
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue/10 focus:border-blue outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <button
          onClick={handleRepay}
          disabled={isLoading}
          className="w-full py-4 bg-blue text-white rounded-2xl font-bold text-sm hover:bg-blue-dark transition-all shadow-md shadow-blue/10 flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isLoading ? "Processing..." : "Pay Now"}
        </button>

        {statusText && (
          <p className="text-[11px] text-center font-bold text-blue animate-pulse mt-2">
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
}