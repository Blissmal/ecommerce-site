import { jsPDF } from "jspdf";

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  product: {
    title: string;
    brand: string | null;
    model: string | null;
  };
  variant: {
    color: string | null;
    size: string | null;
    storage: string | null;
  } | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string | null;
  receipt: string | null;
  createdAt: Date;
  paymentCompletedAt: Date | null;
  billingName: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  phoneNumber: string | null;
  orderItems: OrderItem[];
  user: {
    name: string | null;
    email: string | null;
  };
}

export function generateInvoicePDF(order: Order) {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFillColor(60, 80, 224); // Blue color
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("BLISSMAL", 15, 28);
  doc.text("malutibethuel@gmail.com", 15, 33);
  
  // Invoice Details (Top Right)
  doc.setFontSize(10);
  doc.text(`Invoice #${order.id.slice(-8).toUpperCase()}`, 140, 20);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-KE')}`, 140, 26);
  doc.text(`Status: ${order.status}`, 140, 32);
  
  // Reset text color for body
  doc.setTextColor(0, 0, 0);
  
  // Bill To Section
  let yPos = 55;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 15, yPos);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  yPos += 7;
  doc.text(order.billingName || order.user.name || "N/A", 15, yPos);
  yPos += 5;
  doc.text(order.billingEmail || order.user.email || "N/A", 15, yPos);
  yPos += 5;
  if (order.phoneNumber) {
    doc.text(order.phoneNumber, 15, yPos);
    yPos += 5;
  }
  if (order.billingAddress) {
    doc.text(order.billingAddress, 15, yPos);
    yPos += 5;
  }
  
  // Payment Info (Right side)
  let paymentY = 55;
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INFO:", 140, paymentY);
  doc.setFont("helvetica", "normal");
  paymentY += 7;
  doc.text(`Method: ${order.paymentMethod || 'N/A'}`, 140, paymentY);
  paymentY += 5;
  if (order.receipt) {
    doc.text(`Receipt: ${order.receipt}`, 140, paymentY);
    paymentY += 5;
  }
  if (order.paymentCompletedAt) {
    doc.text(`Paid: ${new Date(order.paymentCompletedAt).toLocaleDateString('en-KE')}`, 140, paymentY);
  }
  
  // Items Table Header
  yPos = Math.max(yPos, paymentY) + 15;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, 180, 10, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ITEM", 20, yPos);
  doc.text("QTY", 120, yPos);
  doc.text("PRICE", 145, yPos);
  doc.text("TOTAL", 175, yPos);
  
  // Items
  yPos += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  let subtotal = 0;
  
  order.orderItems.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    // Item name
    let itemName = item.product.title;
    if (item.product.brand) itemName = `${item.product.brand} ${itemName}`;
    
    // Truncate if too long
    if (itemName.length > 45) {
      itemName = itemName.substring(0, 42) + "...";
    }
    
    doc.text(itemName, 20, yPos);
    
    // Variant info (if exists)
    if (item.variant) {
      yPos += 4;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const variantInfo = [
        item.variant.color,
        item.variant.size,
        item.variant.storage
      ].filter(Boolean).join(", ");
      
      if (variantInfo) {
        doc.text(variantInfo, 20, yPos);
      }
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      yPos += 1;
    }
    
    // Quantity, Price, Total
    doc.text(item.quantity.toString(), 125, yPos - (item.variant ? 4 : 0), { align: "right" });
    doc.text(`KES ${item.price.toLocaleString()}`, 165, yPos - (item.variant ? 4 : 0), { align: "right" });
    doc.text(`KES ${itemTotal.toLocaleString()}`, 190, yPos - (item.variant ? 4 : 0), { align: "right" });
    
    yPos += 10;
    
    // Add separator line
    if (index < order.orderItems.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(15, yPos - 5, 195, yPos - 5);
    }
  });
  
  // Totals Section
  yPos += 10;
  doc.setDrawColor(0, 0, 0);
  doc.line(15, yPos - 5, 195, yPos - 5);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Subtotal:", 140, yPos);
  doc.text(`KES ${subtotal.toLocaleString()}`, 190, yPos, { align: "right" });
  
  yPos += 7;
  doc.text("Tax:", 140, yPos);
  doc.text("KES 0.00", 190, yPos, { align: "right" });
  
  yPos += 10;
  doc.setFillColor(60, 80, 224);
  doc.rect(135, yPos - 7, 60, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("TOTAL:", 140, yPos);
  doc.text(`KES ${order.total.toLocaleString()}`, 190, yPos, { align: "right" });
  
  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const footerY = 280;
  doc.text("Thank you for your business!", 105, footerY, { align: "center" });
  doc.text("For questions about this invoice, please contact malutibethuel@gmail.com", 105, footerY + 5, { align: "center" });
  
  // Save the PDF
  doc.save(`invoice-${order.id.slice(-8).toUpperCase()}.pdf`);
}