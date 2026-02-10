// app/api/admin/orders/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variantSnapshot?: any;
  product: {
    title: string;
    price: number;
  };
  variant?: any;
}

interface Order {
  id: string;
  status: string;
  total: number;
  paymentMethod: string;
  phoneNumber?: string | null;
  billingName?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
  orderNotes?: string | null;
  createdAt: Date | string;
  user: {
    name: string | null;
    email: string;
  };
  orderItems: OrderItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders, format, fields, includeItemDetails, groupByStatus } = body;

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders data' }, { status: 400 });
    }

    // Sort by status if grouping is enabled
    let processedOrders = [...orders];
    if (groupByStatus) {
      processedOrders.sort((a, b) => a.status.localeCompare(b.status));
    }

    switch (format) {
      case 'excel':
        return await generateExcel(processedOrders, fields, includeItemDetails, groupByStatus);
      case 'csv':
        return await generateCSV(processedOrders, fields, includeItemDetails);
      case 'pdf':
        return await generatePDF(processedOrders, fields, includeItemDetails, groupByStatus);
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

async function generateExcel(
  orders: Order[],
  fields: Record<string, boolean>,
  includeItemDetails: boolean,
  groupByStatus: boolean
) {
  const workbook = new ExcelJS.Workbook();
  
  workbook.creator = 'Order Management System';
  workbook.created = new Date();
  
  if (groupByStatus) {
    // Create separate sheets for each status
    const statusGroups = orders.reduce((acc, order) => {
      if (!acc[order.status]) {
        acc[order.status] = [];
      }
      acc[order.status].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    Object.entries(statusGroups).forEach(([status, statusOrders]) => {
      createWorksheet(workbook, status, statusOrders, fields, includeItemDetails);
    });
    
    // Also create a summary sheet
    createSummarySheet(workbook, orders);
  } else {
    createWorksheet(workbook, 'Orders', orders, fields, includeItemDetails);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=orders-export-${new Date().toISOString().split('T')[0]}.xlsx`,
    },
  });
}

function createWorksheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  orders: Order[],
  fields: Record<string, boolean>,
  includeItemDetails: boolean
) {
  const worksheet = workbook.addWorksheet(sheetName);

  // Define columns based on selected fields
  const columns: any[] = [];
  
  if (fields.orderId) columns.push({ header: 'Order ID', key: 'orderId', width: 15 });
  if (fields.customerName) columns.push({ header: 'Customer Name', key: 'customerName', width: 20 });
  if (fields.customerEmail) columns.push({ header: 'Customer Email', key: 'customerEmail', width: 25 });
  if (fields.phoneNumber) columns.push({ header: 'Phone Number', key: 'phoneNumber', width: 15 });
  if (fields.status) columns.push({ header: 'Status', key: 'status', width: 12 });
  if (fields.paymentMethod) columns.push({ header: 'Payment Method', key: 'paymentMethod', width: 15 });
  
  if (includeItemDetails) {
    columns.push({ header: 'Product', key: 'product', width: 30 });
    columns.push({ header: 'Variant', key: 'variant', width: 20 });
    columns.push({ header: 'Item Quantity', key: 'itemQuantity', width: 12 });
    columns.push({ header: 'Item Price', key: 'itemPrice', width: 12 });
  }
  
  if (fields.items && !includeItemDetails) columns.push({ header: 'Items', key: 'items', width: 40 });
  if (fields.quantity) columns.push({ header: 'Total Quantity', key: 'quantity', width: 12 });
  if (fields.total) columns.push({ header: 'Total Amount', key: 'total', width: 12 });
  if (fields.date) columns.push({ header: 'Order Date', key: 'date', width: 18 });
  if (fields.address) columns.push({ header: 'Shipping Address', key: 'address', width: 35 });
  if (fields.notes) columns.push({ header: 'Order Notes', key: 'notes', width: 30 });

  worksheet.columns = columns;

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;

  // Add data rows
  orders.forEach((order) => {
    if (includeItemDetails) {
      // Create a row for each item in the order
      order.orderItems.forEach((item, index) => {
        const row: any = {};
        
        if (fields.orderId) row.orderId = `#${order.id.slice(-8).toUpperCase()}`;
        if (fields.customerName) row.customerName = order.billingName || order.user.name || 'N/A';
        if (fields.customerEmail) row.customerEmail = order.billingEmail || order.user.email;
        if (fields.phoneNumber) row.phoneNumber = order.phoneNumber || 'N/A';
        if (fields.status) row.status = order.status;
        if (fields.paymentMethod) row.paymentMethod = order.paymentMethod;
        
        row.product = item.product.title;
        
        const variantParts: string[] = [];
        if (item.variantSnapshot?.color) variantParts.push(item.variantSnapshot.color);
        if (item.variantSnapshot?.size) variantParts.push(item.variantSnapshot.size);
        if (item.variantSnapshot?.storage) variantParts.push(item.variantSnapshot.storage);
        row.variant = variantParts.length > 0 ? variantParts.join(', ') : 'N/A';
        
        row.itemQuantity = item.quantity;
        row.itemPrice = `KES ${(item.price * item.quantity).toFixed(2)}`;
        
        if (fields.total) row.total = index === 0 ? `KES ${order.total.toFixed(2)}` : '';
        if (fields.date) row.date = index === 0 ? new Date(order.createdAt).toLocaleString() : '';
        if (fields.address) row.address = index === 0 ? (order.billingAddress || 'N/A') : '';
        if (fields.notes) row.notes = index === 0 ? (order.orderNotes || 'N/A') : '';
        
        worksheet.addRow(row);
      });
    } else {
      // Single row per order
      const row: any = {};
      
      if (fields.orderId) row.orderId = `#${order.id.slice(-8).toUpperCase()}`;
      if (fields.customerName) row.customerName = order.billingName || order.user.name || 'N/A';
      if (fields.customerEmail) row.customerEmail = order.billingEmail || order.user.email;
      if (fields.phoneNumber) row.phoneNumber = order.phoneNumber || 'N/A';
      if (fields.status) row.status = order.status;
      if (fields.paymentMethod) row.paymentMethod = order.paymentMethod;
      if (fields.items) {
        row.items = order.orderItems.map(item => 
          `${item.product.title} (x${item.quantity})`
        ).join('; ');
      }
      if (fields.quantity) {
        row.quantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      }
      if (fields.total) row.total = `KES ${order.total.toFixed(2)}`;
      if (fields.date) row.date = new Date(order.createdAt).toLocaleString();
      if (fields.address) row.address = order.billingAddress || 'N/A';
      if (fields.notes) row.notes = order.orderNotes || 'N/A';
      
      worksheet.addRow(row);
    }
  });

  // Add borders and alternating row colors
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowNumber % 2 === 0 ? 'FFF9FAFB' : 'FFFFFFFF' }
      };
    }
    
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });
  });
}

function createSummarySheet(workbook: ExcelJS.Workbook, orders: Order[]) {
  const summarySheet = workbook.addWorksheet('Summary');
  
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  // Style header
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' }
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  summarySheet.addRow({ metric: 'Total Orders', value: totalOrders });
  summarySheet.addRow({ metric: 'Total Revenue', value: `KES ${totalRevenue.toFixed(2)}` });
  summarySheet.addRow({ metric: 'Average Order Value', value: `KES ${(totalRevenue / totalOrders).toFixed(2)}` });
  summarySheet.addRow({ metric: '', value: '' }); // Spacer
  
  Object.entries(statusCounts).forEach(([status, count]) => {
    summarySheet.addRow({ metric: `${status} Orders`, value: count });
  });
}

async function generateCSV(
  orders: Order[],
  fields: Record<string, boolean>,
  includeItemDetails: boolean
) {
  const headers: string[] = [];
  const fieldKeys: string[] = [];

  if (fields.orderId) { headers.push('Order ID'); fieldKeys.push('orderId'); }
  if (fields.customerName) { headers.push('Customer Name'); fieldKeys.push('customerName'); }
  if (fields.customerEmail) { headers.push('Customer Email'); fieldKeys.push('customerEmail'); }
  if (fields.phoneNumber) { headers.push('Phone Number'); fieldKeys.push('phoneNumber'); }
  if (fields.status) { headers.push('Status'); fieldKeys.push('status'); }
  if (fields.paymentMethod) { headers.push('Payment Method'); fieldKeys.push('paymentMethod'); }
  if (fields.items && !includeItemDetails) { headers.push('Items'); fieldKeys.push('items'); }
  if (fields.quantity) { headers.push('Total Quantity'); fieldKeys.push('quantity'); }
  if (fields.total) { headers.push('Total Amount'); fieldKeys.push('total'); }
  if (fields.date) { headers.push('Order Date'); fieldKeys.push('date'); }
  if (fields.address) { headers.push('Shipping Address'); fieldKeys.push('address'); }
  if (fields.notes) { headers.push('Order Notes'); fieldKeys.push('notes'); }

  if (includeItemDetails) {
    headers.push('Product', 'Variant', 'Item Quantity', 'Item Price');
    fieldKeys.push('product', 'variant', 'itemQuantity', 'itemPrice');
  }

  let csv = headers.map(h => `"${h}"`).join(',') + '\n';

  orders.forEach((order) => {
    if (includeItemDetails) {
      order.orderItems.forEach((item) => {
        const row: string[] = [];
        
        if (fields.orderId) row.push(`"#${order.id.slice(-8).toUpperCase()}"`);
        if (fields.customerName) row.push(`"${order.billingName || order.user.name || 'N/A'}"`);
        if (fields.customerEmail) row.push(`"${order.billingEmail || order.user.email}"`);
        if (fields.phoneNumber) row.push(`"${order.phoneNumber || 'N/A'}"`);
        if (fields.status) row.push(`"${order.status}"`);
        if (fields.paymentMethod) row.push(`"${order.paymentMethod}"`);
        
        row.push(`"${item.product.title}"`);
        
        const variantParts: string[] = [];
        if (item.variantSnapshot?.color) variantParts.push(item.variantSnapshot.color);
        if (item.variantSnapshot?.size) variantParts.push(item.variantSnapshot.size);
        if (item.variantSnapshot?.storage) variantParts.push(item.variantSnapshot.storage);
        row.push(`"${variantParts.length > 0 ? variantParts.join(', ') : 'N/A'}"`);
        
        row.push(`${item.quantity}`);
        row.push(`"KES ${(item.price * item.quantity).toFixed(2)}"`);
        
        if (fields.total) row.push(`"KES ${order.total.toFixed(2)}"`);
        if (fields.date) row.push(`"${new Date(order.createdAt).toLocaleString()}"`);
        if (fields.address) row.push(`"${(order.billingAddress || 'N/A').replace(/"/g, '""')}"`);
        if (fields.notes) row.push(`"${(order.orderNotes || 'N/A').replace(/"/g, '""')}"`);
        
        csv += row.join(',') + '\n';
      });
    } else {
      const row: string[] = [];
      
      if (fields.orderId) row.push(`"#${order.id.slice(-8).toUpperCase()}"`);
      if (fields.customerName) row.push(`"${order.billingName || order.user.name || 'N/A'}"`);
      if (fields.customerEmail) row.push(`"${order.billingEmail || order.user.email}"`);
      if (fields.phoneNumber) row.push(`"${order.phoneNumber || 'N/A'}"`);
      if (fields.status) row.push(`"${order.status}"`);
      if (fields.paymentMethod) row.push(`"${order.paymentMethod}"`);
      if (fields.items) {
        const items = order.orderItems.map(item => `${item.product.title} (x${item.quantity})`).join('; ');
        row.push(`"${items}"`);
      }
      if (fields.quantity) {
        row.push(`${order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}`);
      }
      if (fields.total) row.push(`"KES ${order.total.toFixed(2)}"`);
      if (fields.date) row.push(`"${new Date(order.createdAt).toLocaleString()}"`);
      if (fields.address) row.push(`"${(order.billingAddress || 'N/A').replace(/"/g, '""')}"`);
      if (fields.notes) row.push(`"${(order.orderNotes || 'N/A').replace(/"/g, '""')}"`);
      
      csv += row.join(',') + '\n';
    }
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=orders-export-${new Date().toISOString().split('T')[0]}.csv`,
    },
  });
}

async function generatePDF(
  orders: Order[],
  fields: Record<string, boolean>,
  includeItemDetails: boolean,
  groupByStatus: boolean
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55);
  doc.text('Order Export Report', 14, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  doc.text(`Total Orders: ${orders.length}`, 14, 27);

  let startY = 35;

  if (groupByStatus) {
    const statusGroups = orders.reduce((acc, order) => {
      if (!acc[order.status]) {
        acc[order.status] = [];
      }
      acc[order.status].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    Object.entries(statusGroups).forEach(([status, statusOrders], index) => {
      if (index > 0) {
        doc.addPage();
        startY = 15;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text(`${status} Orders (${statusOrders.length})`, 14, startY);
      
      addOrderTable(doc, statusOrders, fields, includeItemDetails, startY + 8);
    });
  } else {
    addOrderTable(doc, orders, fields, includeItemDetails, startY);
  }

  const pdfBuffer = doc.output('arraybuffer');

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=orders-export-${new Date().toISOString().split('T')[0]}.pdf`,
    },
  });
}

function addOrderTable(
  doc: jsPDF,
  orders: Order[],
  fields: Record<string, boolean>,
  includeItemDetails: boolean,
  startY: number
) {
  const headers: string[] = [];
  
  if (fields.orderId) headers.push('Order ID');
  if (fields.customerName) headers.push('Customer');
  if (fields.status) headers.push('Status');
  if (fields.paymentMethod) headers.push('Payment');
  if (!includeItemDetails && fields.items) headers.push('Items');
  if (fields.total) headers.push('Total');
  if (fields.date) headers.push('Date');

  const body = orders.map(order => {
    const row: any[] = [];
    
    if (fields.orderId) row.push(`#${order.id.slice(-8).toUpperCase()}`);
    if (fields.customerName) row.push(order.billingName || order.user.name || 'N/A');
    if (fields.status) row.push(order.status);
    if (fields.paymentMethod) row.push(order.paymentMethod);
    if (!includeItemDetails && fields.items) {
      row.push(order.orderItems.map(item => `${item.product.title} (x${item.quantity})`).join(', '));
    }
    if (fields.total) row.push(`KES ${order.total.toFixed(2)}`);
    if (fields.date) row.push(new Date(order.createdAt).toLocaleDateString());
    
    return row;
  });

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [31, 41, 55]
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { top: 10, left: 14, right: 14 }
  });
}