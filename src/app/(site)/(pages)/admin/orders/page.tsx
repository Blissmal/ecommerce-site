// app/admin/orders/page.tsx

import { prisma } from "../../../../../../lib/prisma";
import OrderActions from "./OrderActions";

async function getOrders() {
  return await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          product: { select: { title: true, price: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function OrdersPage() {
  const orders = await getOrders();

  // Mapping to your custom color configuration
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return 'bg-yellow-light-2 text-yellow-dark';
      case 'PROCESSING': 
        return 'bg-blue-light-5 text-blue-dark';
      case 'SHIPPED': 
        return 'bg-orange/10 text-orange-dark'; // Orange doesn't have a light-6, using opacity
      case 'DELIVERED': 
        return 'bg-green-light-6 text-green-dark';
      case 'CANCELLED': 
        return 'bg-red-light-6 text-red-dark';
      default: 
        return 'bg-gray-1 text-gray-6';
    }
  };

  return (
    <div className="min-h-screen bg-meta p-7.5 font-euclid-circular-a">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-heading-4 font-bold text-dark">Orders Management</h1>
          <p className="text-custom-sm text-body">Monitor and process customer transactions.</p>
        </div>
        <div className="text-custom-sm font-medium text-dark-4 bg-white px-4 py-2 rounded-lg border border-gray-3">
          Total Orders: <span className="text-dark font-bold">{orders.length}</span>
        </div>
      </div>

      {/* Orders Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4.5 mb-8">
        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => {
          const count = orders.filter(order => order.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl shadow-1 p-5.5 border border-gray-3 flex flex-col items-center">
              <div className="text-custom-2xl font-bold text-dark mb-1">{count}</div>
              <div className={`text-2xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(status)}`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-2 rounded-xl border border-gray-3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-3">
            <thead className="bg-gray-1">
              <tr>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-2">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-1 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-custom-sm font-bold text-blue">
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div>
                      <div className="text-custom-sm font-bold text-dark">
                        {order.user.name || 'Guest User'}
                      </div>
                      <div className="text-custom-xs text-body">{order.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-custom-sm text-dark font-medium">
                      {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                    </div>
                    <div className="text-custom-xs text-body space-y-0.5">
                      {order.orderItems.slice(0, 1).map((item, index) => (
                        <div key={index} className="truncate max-w-[150px]">
                          {item.quantity}x {item.product.title}
                        </div>
                      ))}
                      {order.orderItems.length > 1 && (
                        <div className="text-blue-light font-medium italic">
                          +{order.orderItems.length - 1} more products
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-custom-sm font-bold text-dark">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-custom-sm text-dark font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-custom-xs text-body">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                    <OrderActions order={order} />
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