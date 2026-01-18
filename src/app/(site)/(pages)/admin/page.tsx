import { prisma } from "../../../../../lib/prisma";

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

  return {
    userCount,
    productCount,
    orderCount,
    categoryCount,
    recentOrders,
    totalRevenue: totalRevenue._sum.total || 0
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
    <div className="min-h-screen bg-meta p-7.5 font-euclid-circular-a">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-heading-4 font-bold text-dark">Dashboard Overview</h1>
          <p className="text-custom-sm text-body">A high-level summary of your store's performance.</p>
        </div>
        <div className="text-custom-sm font-bold text-dark-5 bg-white px-4 py-2 rounded-lg border border-gray-3 shadow-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7.5 mb-7.5">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-2xl shadow-2 border border-gray-3 p-6 group hover:border-blue transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs font-bold text-dark-5 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-heading-5 font-bold text-dark">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl border flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7.5">
        {/* Revenue Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-2 border border-gray-3 p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24 text-green-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
            </svg>
          </div>
          <h3 className="text-2xs font-bold text-dark-5 uppercase tracking-widest mb-4">Total Revenue</h3>
          <p className="text-heading-3 font-bold text-green-dark tracking-tight">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-dark"></span>
            <p className="text-custom-xs font-bold text-body">Verified Delivered Sales</p>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-2 border border-gray-3 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-2 flex items-center justify-between bg-gray-1/30">
            <h3 className="text-heading-6 font-bold text-dark">Recent Transactions</h3>
            <button className="text-custom-xs font-bold text-blue hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-2">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-2">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-1 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap text-custom-sm font-bold text-dark">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-custom-sm font-bold text-dark">{order.user.name}</div>
                      <div className="text-custom-xs text-body italic">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-custom-sm font-bold text-dark">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider border transition-colors ${
  order.status === 'DELIVERED' ? 'bg-green-light-6 text-green-dark border-green-light-4' :
  order.status === 'PAID'      ? 'bg-blue-light-6 text-blue-dark border-blue-light-4' :
  order.status === 'SHIPPED'   ? 'bg-purple-light-6 text-purple-dark border-purple-light-4' :
  order.status === 'PENDING'   ? 'bg-yellow-light-6 text-yellow-dark border-yellow-light-4' :
  order.status === 'PROCESSING'? 'bg-orange-light-6 text-orange-dark border-orange-light-4' :
  order.status === 'FAILED'    ? 'bg-red-light-6 text-red-dark border-red-light-4' :
  order.status === 'CANCELLED' ? 'bg-gray-2 text-dark-5 border-gray-3' : 
  'bg-gray-1 text-body border-gray-3' // Default fallback
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
    </div>
  );
}