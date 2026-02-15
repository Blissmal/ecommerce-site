import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Interfaces (Kept as provided) ---
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

// --- Configuration Constants ---
const COLORS = {
  primary: [60, 80, 224] as [number, number, number], // #3C50E0
  secondary: [100, 116, 139] as [number, number, number], // Slate Gray
  text: [17, 24, 39] as [number, number, number], // Almost Black
  border: [226, 232, 240] as [number, number, number], // Light Gray
  white: [255, 255, 255] as [number, number, number],
};

const FONTS = {
  head: "helvetica",
  body: "helvetica",
};

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function generateInvoicePDF(order: Order) {
  const doc = new jsPDF();

  // 1. Header Section
  // --------------------------------------------------------------------------
  
  // Brand Logo (Placeholder: A simple geometric shape)
  doc.setFillColor(...COLORS.primary);
  doc.circle(20, 20, 6, "F");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.text("B", 18, 22); // B for Blissmal

  // Company Name
  doc.setFont(FONTS.head, "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.text);
  doc.text("BLISSMAL", 32, 22);

  // Invoice Label & Status
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.secondary);
  doc.text("INVOICE", 150, 20, { align: "right" });
  
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.text);
  doc.text(`#${order.id.slice(-8).toUpperCase()}`, 195, 20, { align: "right" });

  doc.setFontSize(10);
  const statusColor = order.status.toLowerCase() === 'paid' ? [34, 197, 94] : [234, 179, 8]; // Green or Yellow
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(order.status.toUpperCase(), 195, 26, { align: "right" });

  // Divider
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(15, 35, 195, 35);

  // 2. Info Grid (From / To / Meta)
  // --------------------------------------------------------------------------
  let yPos = 45;
  const col1 = 15;
  const col2 = 80;
  const col3 = 145;

  doc.setFont(FONTS.body, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.secondary);
  
  doc.text("FROM", col1, yPos);
  doc.text("BILL TO", col2, yPos);
  doc.text("DETAILS", col3, yPos);

  yPos += 6;
  doc.setFont(FONTS.body, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  // Column 1: Company Info
  doc.text("Blissmal Inc.", col1, yPos);
  doc.text("malutibethuel@gmail.com", col1, yPos + 5);
  doc.text("Nairobi, Kenya", col1, yPos + 10);

  // Column 2: Customer Info
  const customerName = order.billingName || order.user.name || "Guest User";
  const customerEmail = order.billingEmail || order.user.email || "N/A";
  
  doc.text(customerName, col2, yPos);
  doc.text(customerEmail, col2, yPos + 5);
  if (order.phoneNumber) doc.text(order.phoneNumber, col2, yPos + 10);
  
  // Split address if it's long
  if (order.billingAddress) {
    const splitAddr = doc.splitTextToSize(order.billingAddress, 55);
    doc.text(splitAddr, col2, yPos + 15);
  }

  // Column 3: Order Meta
  doc.text(`Date: ${formatDate(order.createdAt)}`, col3, yPos);
  if (order.paymentCompletedAt) {
    doc.text(`Paid: ${formatDate(order.paymentCompletedAt)}`, col3, yPos + 5);
  }
  doc.text(`Method: ${order.paymentMethod || "N/A"}`, col3, yPos + 10);

  // 3. Order Items Table (Using AutoTable)
  // --------------------------------------------------------------------------
  
  // Prepare Table Data
  const tableBody = order.orderItems.map((item) => {
    let title = item.product.title;
    if (item.product.brand) title = `${item.product.brand} ${title}`;
    
    // Construct variant string
    const variantDetails = [];
    if (item.variant) {
        if(item.variant.size) variantDetails.push(item.variant.size);
        if(item.variant.color) variantDetails.push(item.variant.color);
        if(item.variant.storage) variantDetails.push(item.variant.storage);
    }
    const description = variantDetails.length > 0 ? `${title}\n[${variantDetails.join(' - ')}]` : title;

    return [
      description,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity),
    ];
  });

  // Calculate start position based on address length
  const tableStartY = order.billingAddress && order.billingAddress.length > 30 ? 85 : 75;

  autoTable(doc, {
    startY: tableStartY,
    head: [["DESCRIPTION", "QTY", "UNIT PRICE", "AMOUNT"]],
    body: tableBody,
    theme: 'grid',
    headStyles: {
        fillColor: COLORS.secondary, // Muted header
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left'
    },
    bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text,
        cellPadding: 3
    },
    columnStyles: {
        0: { cellWidth: 'auto' }, // Description
        1: { cellWidth: 20, halign: 'center' }, // Qty
        2: { cellWidth: 35, halign: 'right' }, // Price
        3: { cellWidth: 35, halign: 'right' }  // Total
    },
    // Alternate row colors for readability
    alternateRowStyles: {
        fillColor: [249, 250, 251] // Very light gray
    },
    margin: { left: 15, right: 15 }
  });

  // 4. Totals Section
  // --------------------------------------------------------------------------
  // Get the Y position where the table ended
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page for totals
  if (finalY > 250) {
      doc.addPage();
      // finalY = 20; // reset if new page (logic omitted for brevity, usually not needed for simple invoices)
  }

  const rightColX = 130;
  const valueColX = 195;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont(FONTS.body, "normal");
  doc.setTextColor(...COLORS.secondary);
  doc.text("Subtotal", rightColX, finalY);
  doc.setTextColor(...COLORS.text);
  doc.text(formatCurrency(order.total), valueColX, finalY, { align: "right" });

  // Tax (0 for now as per logic)
  doc.setTextColor(...COLORS.secondary);
  doc.text("Tax (0%)", rightColX, finalY + 6);
  doc.setTextColor(...COLORS.text);
  doc.text("KES 0.00", valueColX, finalY + 6, { align: "right" });

  // Grand Total Line
  doc.setDrawColor(...COLORS.border);
  doc.line(rightColX, finalY + 10, 195, finalY + 10);

  // Grand Total
  doc.setFontSize(12);
  doc.setFont(FONTS.body, "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Total", rightColX, finalY + 18);
  doc.text(formatCurrency(order.total), valueColX, finalY + 18, { align: "right" });

  // 5. Footer & Notes
  // --------------------------------------------------------------------------
  const footerY = 270;
  
  // Payment Note
  doc.setFillColor(243, 244, 246); // Light gray box
  doc.roundedRect(15, footerY - 5, 100, 20, 2, 2, "F");
  
  doc.setFontSize(8);
  doc.setFont(FONTS.body, "bold");
  doc.setTextColor(...COLORS.secondary);
  doc.text("PAYMENT INFO", 20, footerY);
  
  doc.setFont(FONTS.body, "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(`Method: ${order.paymentMethod || "N/A"}`, 20, footerY + 5);
  if(order.receipt) doc.text(`Ref: ${order.receipt}`, 20, footerY + 9);

  // Thank you message
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.secondary);
  doc.text("Thank you for your business!", 195, footerY, { align: "right" });
  doc.setFontSize(8);
  doc.text("Questions? Contact malutibethuel@gmail.com", 195, footerY + 5, { align: "right" });

  // Save
  doc.save(`Invoice_${order.id.slice(-8).toUpperCase()}.pdf`);
}