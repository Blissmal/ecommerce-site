"use client";

import { useState, useMemo } from "react";
import OrderActions from "./OrderActions";

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
    };
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

  return (
    <div className="min-h-screen bg-meta p-4 sm:p-6 lg:p-7.5 font-euclid-circular-a">
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
          <button className="flex items-center gap-2 bg-white text-dark font-bold px-4 py-2.5 rounded-xl border border-gray-3 hover:border-blue hover:text-blue transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>

          {/* View Toggle */}
          <div className="bg-white rounded-xl border border-gray-3 p-1 flex gap-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-blue text-white" : "text-body hover:text-dark"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue text-white" : "text-body hover:text-dark"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-light-6 to-blue-light-5 rounded-xl p-4 border border-blue-light-4">
          <div className="text-2xs font-bold text-blue-dark uppercase tracking-wider mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-blue-dark">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-light-6 to-yellow-light-5 rounded-xl p-4 border border-yellow-light-4">
          <div className="text-2xs font-bold text-yellow-dark uppercase tracking-wider mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-dark">{stats.pending}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-light-6 to-blue-light-5 rounded-xl p-4 border border-blue-light-4">
          <div className="text-2xs font-bold text-blue-dark uppercase tracking-wider mb-1">Processing</div>
          <div className="text-2xl font-bold text-blue-dark">{stats.processing}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-light-6 to-purple-light-5 rounded-xl p-4 border border-purple-light-4">
          <div className="text-2xs font-bold text-purple-dark uppercase tracking-wider mb-1">Shipped</div>
          <div className="text-2xl font-bold text-purple-dark">{stats.shipped}</div>
        </div>
        <div className="bg-gradient-to-br from-green-light-6 to-green-light-5 rounded-xl p-4 border border-green-light-4">
          <div className="text-2xs font-bold text-green-dark uppercase tracking-wider mb-1">Delivered</div>
          <div className="text-2xl font-bold text-green-dark">{stats.delivered}</div>
        </div>
        <div className="bg-gradient-to-br from-red-light-6 to-red-light-5 rounded-xl p-4 border border-red-light-4">
          <div className="text-2xs font-bold text-red-dark uppercase tracking-wider mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-red-dark">{stats.cancelled}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-2 to-gray-1 rounded-xl p-4 border border-gray-3">
          <div className="text-2xs font-bold text-dark-5 uppercase tracking-wider mb-1">Failed</div>
          <div className="text-2xl font-bold text-dark">{stats.failed}</div>
        </div>
        <div className="bg-gradient-to-br from-green-light-6 to-green-light-5 rounded-xl p-4 border border-green-light-4">
          <div className="text-2xs font-bold text-green-dark uppercase tracking-wider mb-1">Revenue</div>
          <div className="text-lg font-bold text-green-dark">KES {(stats.totalRevenue / 1000).toFixed(1)}K</div>
        </div>
      </div>

      {/* Urgent Actions Alert */}
      {paidOrders.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-red-light-6 via-orange-light-6 to-yellow-light-6 border-2 border-red-light-4 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="bg-white rounded-full p-3 shadow-md">
                <svg className="w-6 h-6 text-red-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-heading-6 font-bold text-red-dark mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Urgent: {paidOrders.length} Paid {paidOrders.length === 1 ? 'Order' : 'Orders'} Awaiting Approval
              </h3>
              <p className="text-custom-sm text-dark-5 mb-4">
                These orders have been paid and are waiting for your approval to begin processing. Review each order and click "Approve & Process" to start fulfillment.
              </p>
              <div className="flex flex-wrap gap-2">
                {paidOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-white rounded-lg px-3 py-2 border border-gray-3 shadow-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                    </span>
                    <span className="text-2xs font-bold text-blue">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className="text-2xs text-body">•</span>
                    <span className="text-2xs text-dark font-medium">KES {order.total.toFixed(2)}</span>
                  </div>
                ))}
                {paidOrders.length > 5 && (
                  <div className="bg-white rounded-lg px-3 py-2 border border-gray-3 shadow-sm">
                    <span className="text-2xs font-bold text-body">+{paidOrders.length - 5} more</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-2 border border-gray-3 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2 block">Search Orders</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID, customer, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-3 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all text-custom-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-3 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all text-custom-sm font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2 block">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-3 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all text-custom-sm font-medium"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-3 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all text-custom-sm font-medium"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-2xs font-bold text-dark-5 uppercase tracking-wider mb-2 block">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-3 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all text-custom-sm font-medium"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || statusFilter !== "ALL" || dateFilter !== "ALL") && (
          <div className="mt-4 pt-4 border-t border-gray-2 flex items-center gap-2 flex-wrap">
            <span className="text-2xs font-bold text-dark-5">Active Filters:</span>
            {searchQuery && (
              <span className="bg-blue-light-6 text-blue-dark px-3 py-1 rounded-full text-2xs font-bold flex items-center gap-1.5">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-blue">×</button>
              </span>
            )}
            {statusFilter !== "ALL" && (
              <span className="bg-blue-light-6 text-blue-dark px-3 py-1 rounded-full text-2xs font-bold flex items-center gap-1.5">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("ALL")} className="hover:text-blue">×</button>
              </span>
            )}
            {dateFilter !== "ALL" && (
              <span className="bg-blue-light-6 text-blue-dark px-3 py-1 rounded-full text-2xs font-bold flex items-center gap-1.5">
                Date: {dateFilter}
                <button onClick={() => setDateFilter("ALL")} className="hover:text-blue">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setDateFilter("ALL");
              }}
              className="text-2xs font-bold text-red hover:text-red-dark"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="bg-blue text-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">{selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white text-blue font-bold px-4 py-2 rounded-lg hover:bg-blue-light-6 transition-all">
              Export Selected
            </button>
            <button className="bg-white/20 text-white font-bold px-4 py-2 rounded-lg hover:bg-white/30 transition-all">
              Print Labels
            </button>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="bg-white/20 text-white font-bold px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-custom-sm text-body">
          Showing <span className="font-bold text-dark">{filteredOrders.length}</span> of <span className="font-bold text-dark">{orders.length}</span> orders
        </p>
      </div>

      {/* Orders Display - Table View */}
      {viewMode === "table" && (
        <div className="bg-white shadow-2 rounded-2xl border border-gray-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-3">
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
                          {new Date(order.createdAt).toLocaleDateString()}
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
    </div>
  );
}