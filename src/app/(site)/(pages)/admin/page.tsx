import { prisma } from "../../../../../lib/prisma";
import Link from "next/link";

// app/admin/page.tsx
async function getDashboardStats() {
  const [userCount, productCount, orderCount, categoryCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: { product: { select: { title: true } } }
      }
    }
  });

  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: 'DELIVERED' }
  });

  // Count orders needing action
  const paidOrdersCount = await prisma.order.count({
    where: { status: 'PAID' }
  });

  const processingOrdersCount = await prisma.order.count({
    where: { status: 'PROCESSING' }
  });

  const shippedOrdersCount = await prisma.order.count({
    where: { status: 'SHIPPED' }
  });

  return {
    userCount,
    productCount,
    orderCount,
    categoryCount,
    recentOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    paidOrdersCount,
    processingOrdersCount,
    shippedOrdersCount
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { title: "Total Users", value: stats.userCount, icon: "👥", color: "bg-blue-light-6 text-blue-dark border-blue-light-4" },
    { title: "Total Products", value: stats.productCount, icon: "📦", color: "bg-green-light-6 text-green-dark border-green-light-4" },
    { title: "Total Orders", value: stats.orderCount, icon: "📋", color: "bg-yellow-light-6 text-yellow-dark border-yellow-light-4" },
    { title: "Categories", value: stats.categoryCount, icon: "🏷️", color: "bg-purple-light-6 text-purple-dark border-purple-light-4" },
  ];

  return (
    <div className="min-h-screen bg-meta p-4 sm:p-6 lg:p-7.5 font-euclid-circular-a">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-heading-4 font-bold text-dark">Dashboard Overview</h1>
            {stats.paidOrdersCount > 0 && (
              <div className="relative inline-flex w-fit">
                <span className="flex h-3 w-3 absolute -top-1 -right-1 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red"></span>
                </span>
                <Link href="/admin/orders" className="w-fit">
                  <div className="bg-gradient-to-r from-red-light-6 to-orange-light-6 text-red-dark px-3 sm:px-4 py-2 rounded-xl border-2 border-red-light-4 font-bold text-xs sm:text-custom-sm flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="whitespace-nowrap">{stats.paidOrdersCount} {stats.paidOrdersCount === 1 ? 'order' : 'orders'} need attention</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-custom-sm text-body mt-1">A high-level summary of your store's performance.</p>
        </div>
        <div className="text-xs sm:text-custom-sm font-bold text-dark-5 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-3 shadow-1 w-fit">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Action Required Alert - Fully Responsive */}
      {stats.paidOrdersCount > 0 && (
        <div className="mb-6 sm:mb-7.5 bg-gradient-to-r from-red-light-6 via-orange-light-6 to-yellow-light-6 border-2 border-red-light-4 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="bg-white rounded-full p-2 sm:p-3 shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-heading-6 font-bold text-red-dark mb-1 sm:mb-2">
                  ⚠️ {stats.paidOrdersCount} Paid {stats.paidOrdersCount === 1 ? 'Order' : 'Orders'} Awaiting Approval
                </h3>
                <p className="text-xs sm:text-custom-sm text-dark-5 mb-2 sm:mb-3">
                  Review and approve paid orders to begin processing and fulfillment.
                </p>
                <div className="space-y-1 sm:space-y-2">
                  {stats.processingOrdersCount > 0 && (
                    <p className="text-2xs sm:text-custom-xs text-body">
                      📦 {stats.processingOrdersCount} order{stats.processingOrdersCount !== 1 ? 's' : ''} currently processing
                    </p>
                  )}
                  {stats.shippedOrdersCount > 0 && (
                    <p className="text-2xs sm:text-custom-xs text-body">
                      🚚 {stats.shippedOrdersCount} order{stats.shippedOrdersCount !== 1 ? 's' : ''} shipped
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Link href="/admin/orders" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gradient-to-r from-red-dark to-red text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="whitespace-nowrap">View Orders</span>
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-7.5 mb-6 sm:mb-7.5">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl sm:rounded-2xl shadow-2 border border-gray-3 p-4 sm:p-6 group hover:border-blue transition-all">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-[9px] sm:text-2xs font-bold text-dark-5 uppercase tracking-widest mb-1 truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl lg:text-heading-5 font-bold text-dark">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl border flex items-center justify-center text-lg sm:text-xl lg:text-2xl transition-transform group-hover:scale-110 flex-shrink-0 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue and Recent Orders - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7.5">
        {/* Revenue Card */}
        <div className="lg:col-span-1 bg-white rounded-xl sm:rounded-2xl shadow-2 border border-gray-3 p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 text-green-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
            </svg>
          </div>
          <h3 className="text-2xs font-bold text-dark-5 uppercase tracking-widest mb-3 sm:mb-4">Total Revenue</h3>
          <p className="text-2xl sm:text-3xl lg:text-heading-3 font-bold text-green-dark tracking-tight break-words">
            KES {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 sm:mt-4 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-dark flex-shrink-0"></span>
            <p className="text-2xs sm:text-custom-xs font-bold text-body">Verified Delivered Sales</p>
          </div>
        </div>

        {/* Recent Orders Table - Responsive */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-2 border border-gray-3 overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-2 flex items-center justify-between bg-gray-1/30">
            <h3 className="text-base sm:text-lg lg:text-heading-6 font-bold text-dark">Recent Transactions</h3>
            <Link href="/admin/orders">
              <button className="text-2xs sm:text-custom-xs font-bold text-blue hover:underline whitespace-nowrap">View All</button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-2">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-[9px] sm:text-2xs font-bold text-dark-5 uppercase tracking-wider">Order</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-[9px] sm:text-2xs font-bold text-dark-5 uppercase tracking-wider">Customer</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-[9px] sm:text-2xs font-bold text-dark-5 uppercase tracking-wider">Amount</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-[9px] sm:text-2xs font-bold text-dark-5 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-2">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-1 transition-colors group">
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {order.status === 'PAID' && (
                          <span className="flex h-2 w-2 flex-shrink-0">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                          </span>
                        )}
                        <span className="text-xs sm:text-custom-sm font-bold text-dark truncate">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5">
                      <div className="max-w-[120px] sm:max-w-none">
                        <div className="text-xs sm:text-custom-sm font-bold text-dark truncate">{order.user.name}</div>
                        <div className="text-[9px] sm:text-custom-xs text-body italic truncate">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5 whitespace-nowrap text-xs sm:text-custom-sm font-bold text-dark">
                      KES {order.total.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5 whitespace-nowrap">
                      <span className={`inline-flex px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-2xs font-bold rounded-full uppercase tracking-wider border transition-colors ${
  order.status === 'DELIVERED' ? 'bg-green-light-6 text-green-dark border-green-light-4' :
  order.status === 'PAID'      ? 'bg-green-light-6 text-green-dark border-green-light-4' :
  order.status === 'SHIPPED'   ? 'bg-purple-light-6 text-purple-dark border-purple-light-4' :
  order.status === 'PENDING'   ? 'bg-yellow-light-6 text-yellow-dark border-yellow-light-4' :
  order.status === 'PROCESSING'? 'bg-blue-light-5 text-blue-dark border-blue-light-4' :
  order.status === 'FAILED'    ? 'bg-red-light-6 text-red-dark border-red-light-4' :
  order.status === 'CANCELLED' ? 'bg-gray-2 text-dark-5 border-gray-3' : 
  'bg-gray-1 text-body border-gray-3'
}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Action Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7.5 mt-6 sm:mt-7.5">
        <Link href="/admin/orders">
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-5 sm:p-6 hover:border-blue transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-blue-light-6 rounded-lg p-2.5 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              {stats.paidOrdersCount > 0 && (
                <span className="bg-red text-white text-2xs font-bold px-2 py-1 rounded-full">
                  {stats.paidOrdersCount}
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg lg:text-heading-6 font-bold text-dark mb-1 sm:mb-2 group-hover:text-blue transition-colors">
              Manage Orders
            </h4>
            <p className="text-xs sm:text-custom-xs text-body">
              Review, approve, and process customer orders
            </p>
          </div>
        </Link>

        <Link href="/admin/products">
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-5 sm:p-6 hover:border-green transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-green-light-6 rounded-lg p-2.5 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h4 className="text-base sm:text-lg lg:text-heading-6 font-bold text-dark mb-1 sm:mb-2 group-hover:text-green transition-colors">
              Manage Products
            </h4>
            <p className="text-xs sm:text-custom-xs text-body">
              Add, edit, and organize your product catalog
            </p>
          </div>
        </Link>

        <Link href="/admin/categories">
          <div className="bg-white rounded-xl shadow-2 border border-gray-3 p-5 sm:p-6 hover:border-purple transition-all cursor-pointer group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-purple-light-6 rounded-lg p-2.5 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <h4 className="text-base sm:text-lg lg:text-heading-6 font-bold text-dark mb-1 sm:mb-2 group-hover:text-purple transition-colors">
              Manage Categories
            </h4>
            <p className="text-xs sm:text-custom-xs text-body">
              Organize products with categories and tags
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}