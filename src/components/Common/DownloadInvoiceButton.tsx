"use client";

import React from "react";
import { FileText } from "lucide-react";
import { generateInvoicePDF } from "@/lib/utils/invoice-generator";

interface DownloadInvoiceButtonProps {
  order: any;
}

export default function DownloadInvoiceButton({ order }: DownloadInvoiceButtonProps) {
  const handleDownload = () => {
    try {
      generateInvoicePDF(order);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full py-4 bg-white text-dark border border-blue/10 rounded-2xl font-bold text-sm hover:bg-white/50 transition-all flex items-center justify-center gap-2"
    >
      <FileText className="w-4 h-4" /> Download Invoice
    </button>
  );
}