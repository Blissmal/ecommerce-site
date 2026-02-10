// app/admin/orders/ExportModal.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type OrderStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  paymentMethod: 'MPESA' | 'BANK';
  phoneNumber?: string | null;
  billingName?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
  orderNotes?: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    variantSnapshot?: any;
    product: {
      title: string;
      price: number;
    };
    variant?: any;
  }>;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  selectedOrders?: Set<string>;
}

type ExportFormat = 'csv' | 'excel' | 'pdf';
type ExportScope = 'all' | 'filtered' | 'selected';
type DateRange = 'all' | 'today' | 'week' | 'month' | 'custom';

const EXPORT_FIELDS = [
  { key: 'orderId', label: 'Order ID', checked: true },
  { key: 'customerName', label: 'Customer Name', checked: true },
  { key: 'customerEmail', label: 'Customer Email', checked: true },
  { key: 'phoneNumber', label: 'Phone Number', checked: false },
  { key: 'status', label: 'Order Status', checked: true },
  { key: 'paymentMethod', label: 'Payment Method', checked: true },
  { key: 'items', label: 'Items', checked: true },
  { key: 'quantity', label: 'Total Quantity', checked: false },
  { key: 'total', label: 'Order Total', checked: true },
  { key: 'date', label: 'Order Date', checked: true },
  { key: 'address', label: 'Shipping Address', checked: false },
  { key: 'notes', label: 'Order Notes', checked: false },
];

export default function ExportModal({ isOpen, onClose, orders, selectedOrders }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [exportScope, setExportScope] = useState<ExportScope>(
    selectedOrders && selectedOrders.size > 0 ? 'selected' : 'all'
  );
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedFields, setSelectedFields] = useState(
    EXPORT_FIELDS.reduce((acc, field) => {
      acc[field.key] = field.checked;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [includeItemDetails, setIncludeItemDetails] = useState(false);
  const [groupByStatus, setGroupByStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleField = (key: string) => {
    setSelectedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllFields = () => {
    const allChecked = Object.values(selectedFields).every(v => v);
    const newState = EXPORT_FIELDS.reduce((acc, field) => {
      acc[field.key] = !allChecked;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedFields(newState);
  };

  const getOrdersToExport = () => {
    let ordersToExport = [...orders];

    // Filter by scope
    if (exportScope === 'selected' && selectedOrders) {
      ordersToExport = ordersToExport.filter(order => selectedOrders.has(order.id));
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      ordersToExport = ordersToExport.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        if (dateRange === 'today') {
          return orderDate >= today;
        } else if (dateRange === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        } else if (dateRange === 'month') {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        } else if (dateRange === 'custom' && customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        
        return true;
      });
    }

    return ordersToExport;
  };

  const handleExport = async () => {
    const ordersToExport = getOrdersToExport();

    if (ordersToExport.length === 0) {
      toast.error('No orders to export with the selected filters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/order/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: ordersToExport,
          format: exportFormat,
          fields: selectedFields,
          includeItemDetails,
          groupByStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = exportFormat === 'excel' ? 'xlsx' : exportFormat === 'pdf' ? 'pdf' : 'csv';
      a.download = `orders-export-${timestamp}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported ${ordersToExport.length} orders successfully`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const ordersCount = getOrdersToExport().length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue to-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-heading-5 font-bold text-dark">Export Orders</h2>
                <p className="text-custom-sm text-body">Configure and download your order data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-1 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Export Format */}
          <div>
            <label className="block text-custom-sm font-bold text-dark mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'excel', label: 'Excel', icon: '📊', description: 'XLSX with formatting' },
                { value: 'csv', label: 'CSV', icon: '📄', description: 'Comma-separated values' },
                { value: 'pdf', label: 'PDF', icon: '📕', description: 'Printable document' },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as ExportFormat)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left
                    ${exportFormat === format.value
                      ? 'border-blue bg-blue-light-6 shadow-lg'
                      : 'border-gray-3 hover:border-blue/50 bg-white'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{format.icon}</div>
                  <div className="text-custom-sm font-bold text-dark">{format.label}</div>
                  <div className="text-2xs text-body mt-1">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Scope */}
          <div>
            <label className="block text-custom-sm font-bold text-dark mb-3">Export Scope</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportScope('all')}
                className={`
                  p-3 rounded-xl border-2 transition-all
                  ${exportScope === 'all'
                    ? 'border-blue bg-blue-light-6'
                    : 'border-gray-3 hover:border-blue/50 bg-white'
                  }
                `}
              >
                <div className="text-custom-sm font-bold text-dark">All Orders</div>
                <div className="text-2xs text-body mt-1">{orders.length} orders</div>
              </button>
              
              {selectedOrders && selectedOrders.size > 0 && (
                <button
                  onClick={() => setExportScope('selected')}
                  className={`
                    p-3 rounded-xl border-2 transition-all
                    ${exportScope === 'selected'
                      ? 'border-blue bg-blue-light-6'
                      : 'border-gray-3 hover:border-blue/50 bg-white'
                    }
                  `}
                >
                  <div className="text-custom-sm font-bold text-dark">Selected Only</div>
                  <div className="text-2xs text-body mt-1">{selectedOrders.size} selected</div>
                </button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-custom-sm font-bold text-dark mb-3">Date Range</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'custom', label: 'Custom Range' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value as DateRange)}
                  className={`
                    px-4 py-2 rounded-lg border-2 text-custom-sm font-bold transition-all
                    ${dateRange === range.value
                      ? 'border-blue bg-blue-light-6 text-blue-dark'
                      : 'border-gray-3 text-body hover:border-blue/50'
                    }
                  `}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-2xs font-bold text-body mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-body mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fields to Export */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-custom-sm font-bold text-dark">Fields to Export</label>
              <button
                onClick={toggleAllFields}
                className="text-2xs font-bold text-blue hover:underline"
              >
                {Object.values(selectedFields).every(v => v) ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-1 p-4 rounded-xl">
              {EXPORT_FIELDS.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields[field.key]}
                    onChange={() => toggleField(field.key)}
                    className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                  />
                  <span className="text-custom-sm text-dark group-hover:text-blue transition-colors">
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <label className="block text-custom-sm font-bold text-dark mb-3">Additional Options</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-gray-3 hover:border-blue/50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={includeItemDetails}
                  onChange={(e) => setIncludeItemDetails(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                />
                <div>
                  <div className="text-custom-sm font-bold text-dark">Include Item Details</div>
                  <div className="text-2xs text-body mt-1">Export a separate row for each item in the order</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 border-gray-3 hover:border-blue/50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={groupByStatus}
                  onChange={(e) => setGroupByStatus(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                />
                <div>
                  <div className="text-custom-sm font-bold text-dark">Group by Status</div>
                  <div className="text-2xs text-body mt-1">Organize exported data by order status</div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-blue-light-6 to-purple-light-6 border border-blue-light-4 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-custom-sm font-bold text-blue-dark">
                  Ready to export {ordersCount} order{ordersCount !== 1 ? 's' : ''}
                </p>
                <p className="text-2xs text-blue-dark/70 mt-1">
                  {Object.values(selectedFields).filter(v => v).length} fields • {exportFormat.toUpperCase()} format
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-2 bg-gray-1 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-white text-dark font-bold py-3 rounded-xl hover:bg-gray-2 transition-all border border-gray-3 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || ordersCount === 0}
            className="flex-1 bg-gradient-to-r from-blue to-purple text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export {ordersCount} Order{ordersCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}