// app/admin/orders/page.tsx

import { prisma } from "../../../../../../lib/prisma";
import OrderActions from "./OrderActions";

async function getOrders() {
  return await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          product: { select: { title: true, price: true } },
          variant: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function OrdersPage() {
  const orders = await getOrders();

  // Count PAID orders that need action
  const paidOrdersCount = orders.filter(order => order.status === 'PAID').length;

  // Mapping to your custom color configuration
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': 
      case 'DELIVERED': 
        return 'bg-green-light-6 text-green-dark border border-green-light-4';

      case 'FAILED': 
      case 'CANCELLED': 
        return 'bg-red-light-6 text-red-dark border border-red-light-4';

      case 'PENDING': 
        return 'bg-yellow-light-2 text-yellow-dark border border-yellow-light-3';

      case 'PROCESSING': 
        return 'bg-blue-light-5 text-blue-dark border border-blue-light-4';

      case 'SHIPPED': 
        return 'bg-yellow-light-1 text-orange-dark border border-yellow-light-2';

      default: 
        return 'bg-gray-1 text-gray-6';
    }
  };

  return (
    <div className="min-h-screen bg-meta p-7.5 font-euclid-circular-a">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-heading-4 font-bold text-dark">Orders Management</h1>
            {paidOrdersCount > 0 && (
              <div className="relative inline-flex">
                <span className="flex h-3 w-3 absolute -top-1 -right-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red"></span>
                </span>
                <div className="bg-gradient-to-r from-red-light-6 to-orange-light-6 text-red-dark px-4 py-2 rounded-xl border-2 border-red-light-4 font-bold text-custom-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {paidOrdersCount} {paidOrdersCount === 1 ? 'order' : 'orders'} awaiting approval
                </div>
              </div>
            )}
          </div>
          <p className="text-custom-sm text-body mt-1">Monitor and process customer transactions.</p>
        </div>
        <div className="text-custom-sm font-medium text-dark-4 bg-white px-4 py-2 rounded-lg border border-gray-3">
          Total Orders: <span className="text-dark font-bold">{orders.length}</span>
        </div>
      </div>

      {/* Action Required Banner */}
      {paidOrdersCount > 0 && (
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
                Action Required: {paidOrdersCount} {paidOrdersCount === 1 ? 'Order' : 'Orders'} Awaiting Approval
              </h3>
              <p className="text-custom-sm text-dark-5 mb-4">
                You have paid orders waiting to be processed. Review each order and approve to begin fulfillment. 
                Click "Approve & Process" to move orders from PAID to PROCESSING status.
              </p>
              <div className="flex flex-wrap gap-3">
                {orders
                  .filter(order => order.status === 'PAID')
                  .slice(0, 3)
                  .map(order => (
                    <div key={order.id} className="bg-white rounded-lg px-4 py-2 border border-gray-3 shadow-sm">
                      <span className="text-2xs font-bold text-blue">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className="text-2xs text-body mx-2">•</span>
                      <span className="text-2xs text-dark font-medium">${order.total.toFixed(2)}</span>
                    </div>
                  ))}
                {paidOrdersCount > 3 && (
                  <div className="bg-white rounded-lg px-4 py-2 border border-gray-3 shadow-sm">
                    <span className="text-2xs font-bold text-body">+{paidOrdersCount - 3} more</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4.5 mb-8">
        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => {
          const count = orders.filter(order => order.status === status).length;
          const isPaid = status === 'PAID';
          return (
            <div key={status} className={`bg-white rounded-xl shadow-1 p-5.5 border border-gray-3 flex flex-col items-center ${isPaid && count > 0 ? 'ring-2 ring-red ring-offset-2' : ''}`}>
              <div className="text-custom-2xl font-bold text-dark mb-1">{count}</div>
              <div className={`text-2xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(status)}`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* PAID Orders Need Attention Section */}
      {paidOrdersCount > 0 && (
        <div className="mb-8 bg-white shadow-2 rounded-xl border-2 border-red-light-4 overflow-hidden">
          <div className="bg-gradient-to-r from-red-light-6 to-orange-light-6 px-6 py-4 border-b-2 border-red-light-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                </span>
                <h2 className="text-heading-6 font-bold text-red-dark">Orders Requiring Immediate Attention</h2>
              </div>
              <span className="bg-white text-red-dark px-3 py-1 rounded-full text-2xs font-bold border border-red-light-4">
                {paidOrdersCount} PAID
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-3">
              <thead className="bg-gray-1">
                <tr>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Time Since Payment</th>
                  <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-2">
                {orders
                  .filter(order => order.status === 'PAID')
                  .map((order) => {
                    const timeDiff = Date.now() - new Date(order.createdAt).getTime();
                    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutes = Math.floor(timeDiff / (1000 * 60));
                    const timeText = hours < 1 ? `${minutes}m` : hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
                    
                    return (
                      <tr key={order.id} className="hover:bg-red-light-6/30 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                            </span>
                            <span className="text-custom-sm font-bold text-blue">
                              #{order.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
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
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-custom-sm font-bold text-dark">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-custom-sm font-bold text-red-dark">{timeText} ago</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
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

      {/* All Orders Table */}
      <div className="bg-white shadow-2 rounded-xl border border-gray-3 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-3 bg-gray-1">
          <h2 className="text-heading-6 font-bold text-dark">All Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-3">
            <thead className="bg-gray-1">
              <tr>
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-1 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {order.status === 'PAID' && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                        </span>
                      )}
                      <span className="text-custom-sm font-bold text-blue">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
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