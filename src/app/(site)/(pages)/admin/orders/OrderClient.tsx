// app/admin/orders/OrderClient.tsx (UPDATED VERSION)
"use client";

import { useState, useMemo } from "react";
import OrderActions from "./OrderActions";
import BatchOperations from "./BatchOperations";
import ExportModal from "./ExportModal";

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

interface Stats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  failed: number;
  totalRevenue: number;
}

export default function OrdersClient({ orders, stats }: { orders: Order[], stats: Stats }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query) ||
        order.user.name?.toLowerCase().includes(query) ||
        order.billingName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "ALL") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (dateFilter === "TODAY") return orderDate >= today;
        if (dateFilter === "WEEK") return orderDate >= weekAgo;
        if (dateFilter === "MONTH") return orderDate >= monthAgo;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortOrder === "asc" ? -diff : diff;
      } else {
        const diff = b.total - a.total;
        return sortOrder === "asc" ? -diff : diff;
      }
    });

    return filtered;
  }, [orders, searchQuery, statusFilter, dateFilter, sortBy, sortOrder]);

  const paidOrders = filteredOrders.filter(order => order.status === 'PAID');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return 'bg-green-light-6 text-green-dark border-green-light-4';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-light-6 text-red-dark border-red-light-4';
      case 'PENDING':
        return 'bg-yellow-light-2 text-yellow-dark border-yellow-light-3';
      case 'PROCESSING':
        return 'bg-blue-light-5 text-blue-dark border-blue-light-4';
      case 'SHIPPED':
        return 'bg-purple-light-6 text-purple-dark border-purple-light-4';
      default:
        return 'bg-gray-1 text-gray-6 border-gray-3';
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  return (
    <div className="min-h-screen bg-meta p-4 sm:p-6 lg:p-7.5 font-euclid-circular-a pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl lg:text-heading-4 font-bold text-dark">Order Management</h1>
            {paidOrders.length > 0 && (
              <div className="relative">
                <span className="flex h-3 w-3 absolute -top-1 -right-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red"></span>
                </span>
                <div className="bg-gradient-to-r from-red-light-6 to-orange-light-6 text-red-dark px-3 py-1.5 rounded-lg border-2 border-red-light-4 font-bold text-custom-xs">
                  {paidOrders.length} need approval
                </div>
              </div>
            )}
          </div>
          <p className="text-custom-sm text-body">Monitor, process, and manage all customer orders</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-white text-dark font-bold px-4 py-2.5 rounded-xl border border-gray-3 hover:border-blue hover:text-blue transition-all hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
            {selectedOrders.size > 0 && (
              <span className="bg-blue text-white text-2xs px-2 py-0.5 rounded-full">
                {selectedOrders.size}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-3 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-blue text-white"
                  : "text-body hover:text-dark"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-blue text-white"
                  : "text-body hover:text-dark"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-2 border border-gray-3 p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold text-body uppercase tracking-wider mb-1">Total</div>
          <div className="text-heading-5 font-bold text-dark">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-light-2 to-yellow-light-1 rounded-2xl border border-yellow-light-3 p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold text-yellow-dark uppercase tracking-wider mb-1">Pending</div>
          <div className="text-heading-5 font-bold text-yellow-dark">{stats.pending}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-light-6 to-blue-light-5 rounded-2xl border border-blue-light-4 p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold text-blue-dark uppercase tracking-wider mb-1">Processing</div>
          <div className="text-heading-5 font-bold text-blue-dark">{stats.processing}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-light-6 to-purple-light-5 rounded-2xl border border-purple-light-4 p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold text-purple-dark uppercase tracking-wider mb-1">Shipped</div>
          <div className="text-heading-5 font-bold text-purple-dark">{stats.shipped}</div>
        </div>
        <div className="bg-gradient-to-br from-green-light-6 to-green-light-5 rounded-2xl border border-green-light-4 p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold text-green-dark uppercase tracking-wider mb-1">Delivered</div>
          <div className="text-heading-5 font-bold text-green-dark">{stats.delivered}</div>
        </div>
        <div className="bg-gradient-to-br from-red-light-6 to-red-light-5 rounded-2xl border border-red-light-4 p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold text-red-dark uppercase tracking-wider mb-1">Cancelled</div>
          <div className="text-heading-5 font-bold text-red-dark">{stats.cancelled}</div>
        </div>
        <div className="bg-gradient-to-br from-red-light-6 to-red-light-5 rounded-2xl border border-red-light-4 p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold text-red-dark uppercase tracking-wider mb-1">Failed</div>
          <div className="text-heading-5 font-bold text-red-dark">{stats.failed}</div>
        </div>
        <div className="bg-green-light-6 text-green-dark rounded-2xl border border-green-dark p-4 hover:shadow-lg transition-all">
          <div className="text-2xs font-bold uppercase tracking-wider mb-1">Revenue</div>
          <div className="text-custom-sm font-bold">KES {stats.totalRevenue.toFixed(0)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-2 border border-gray-3 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search-query" className="block text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="search-query"
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-3 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-3 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label htmlFor="date-filter" className="block text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2">Date Range</label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-3 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all font-medium"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort-by" className="block text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-4 py-2.5 border border-gray-3 rounded-xl focus:ring-2 focus:ring-blue focus:border-blue transition-all font-medium"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2.5 border border-gray-3 rounded-xl hover:bg-gray-1 transition-all"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || statusFilter !== "ALL" || dateFilter !== "ALL" || selectedOrders.size > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-2 flex flex-wrap items-center gap-2">
            <span className="text-custom-xs font-bold text-body">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-blue-light-6 text-blue-dark px-3 py-1 rounded-full text-2xs font-bold">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="hover:text-blue">×</button>
              </span>
            )}
            {statusFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 bg-purple-light-6 text-purple-dark px-3 py-1 rounded-full text-2xs font-bold">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("ALL")} className="hover:text-purple">×</button>
              </span>
            )}
            {dateFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 bg-green-light-6 text-green-dark px-3 py-1 rounded-full text-2xs font-bold">
                Date: {dateFilter}
                <button onClick={() => setDateFilter("ALL")} className="hover:text-green">×</button>
              </span>
            )}
            {selectedOrders.size > 0 && (
              <span className="inline-flex items-center gap-1 bg-yellow-light-2 text-yellow-dark px-3 py-1 rounded-full text-2xs font-bold">
                {selectedOrders.size} selected
                <button onClick={clearSelection} className="hover:text-yellow">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setDateFilter("ALL");
                clearSelection();
              }}
              className="text-2xs font-bold text-red hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-custom-sm text-body">
          Showing <span className="font-bold text-dark">{filteredOrders.length}</span> of{" "}
          <span className="font-bold text-dark">{orders.length}</span> orders
        </p>
      </div>

      {/* Orders Display - Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow-2 border border-gray-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-2">
                {filteredOrders.map((order) => {
                  const timeDiff = Date.now() - new Date(order.createdAt).getTime();
                  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                  const days = Math.floor(hours / 24);
                  const timeAgo = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : 'Just now';

                  return (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gray-1 transition-colors ${selectedOrders.has(order.id) ? 'bg-blue-light-6/30' : ''}`}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {order.status === 'PAID' && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                            </span>
                          )}
                          <span className="text-custom-sm font-bold text-blue">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <div className="text-custom-sm font-bold text-dark">{order.user.name || 'Guest User'}</div>
                          <div className="text-custom-xs text-body">{order.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-custom-sm font-medium text-dark">
                          {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-custom-sm font-bold text-dark">KES {order.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-custom-sm text-dark font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-KE')}
                        </div>
                        <div className="text-custom-xs text-body">{timeAgo}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <OrderActions order={order} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Display - Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const timeDiff = Date.now() - new Date(order.createdAt).getTime();
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            const timeAgo = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : 'Just now';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-2 border border-gray-3 p-5 hover:shadow-lg transition-all ${selectedOrders.has(order.id) ? 'ring-2 ring-blue' : ''}`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                    />
                    {order.status === 'PAID' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                      </span>
                    )}
                    <span className="text-custom-sm font-bold text-blue">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-4 pb-4 border-b border-gray-2">
                  <div className="text-custom-sm font-bold text-dark mb-1">{order.user.name || 'Guest User'}</div>
                  <div className="text-custom-xs text-body">{order.user.email}</div>
                </div>

                {/* Order Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-custom-sm">
                    <span className="text-body">Items:</span>
                    <span className="font-bold text-dark">{order.orderItems.length}</span>
                  </div>
                  <div className="flex justify-between text-custom-sm">
                    <span className="text-body">Total:</span>
                    <span className="font-bold text-dark">KES {order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-custom-sm">
                    <span className="text-body">Date:</span>
                    <span className="font-medium text-dark">{timeAgo}</span>
                  </div>
                </div>

                {/* Actions */}
                <OrderActions order={order} />
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-2xl shadow-2 border border-gray-3 p-12 text-center">
          <div className="w-16 h-16 bg-gray-1 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-heading-6 font-bold text-dark mb-2">No Orders Found</h3>
          <p className="text-custom-sm text-body">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Batch Operations Component */}
      <BatchOperations
        selectedOrders={selectedOrders}
        onClearSelection={clearSelection}
        totalOrders={filteredOrders.length}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        orders={filteredOrders}
        selectedOrders={selectedOrders}
      />
    </div>
  );
}