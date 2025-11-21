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
    { title: "Total Users", value: stats.userCount, icon: "👥", color: "bg-blue-light" },
    { title: "Total Products", value: stats.productCount, icon: "📦", color: "bg-green-light" },
    { title: "Total Orders", value: stats.orderCount, icon: "📋", color: "bg-yellow-light" },
    { title: "Categories", value: stats.categoryCount, icon: "🏷️", color: "bg-[#CF9FFF]" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-5">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-7">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-7 mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-green-5">${stats.totalRevenue.toFixed(2)}</p>
        <p className="text-sm text-gray-4 mt-1">From completed orders</p>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-2">
          <h3 className="text-lg font-semibold text-gray-7">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-1">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-5 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-5 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-5 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-5 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-5 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-5 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-2">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-1">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-7">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-7">{order.user.name}</div>
                      <div className="text-sm text-gray-5">{order.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-5">
                    {order.orderItems.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-7">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-light-5 text-green-dark' :
                      order.status === 'PENDING' ? 'bg-yellow-light-4 text-yellow-dark' :
                      order.status === 'PROCESSING' ? 'bg-blue-light-5 text-blue-dark' :
                      'bg-red-light-5 text-red-dark'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}