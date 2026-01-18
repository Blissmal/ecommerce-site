// app/admin/users/page.tsx

import { prisma } from "../../../../../../lib/prisma";
import UserActions from "./UserActions";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orders: { select: { id: true, total: true } }
    }
  });
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-meta p-7.5 font-euclid-circular-a">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-heading-4 font-bold text-dark">Users Management</h1>
          <p className="text-custom-sm text-body">Monitor user activity, roles, and purchasing history.</p>
        </div>
        <div className="bg-white border border-gray-3 px-4 py-2 rounded-lg shadow-1">
          <span className="text-custom-xs font-bold text-dark-5 uppercase tracking-widest block">Total Customers</span>
          <span className="text-heading-6 font-bold text-blue">{users.length}</span>
        </div>
      </div>

      <div className="bg-white shadow-2 rounded-xl border border-gray-3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-3">
            <thead className="bg-gray-1">
              <tr>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  User Profile
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Access Level
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Lifetime Value
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-2">
              {users.map((user) => {
                const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
                return (
                  <tr key={user.id} className="hover:bg-gray-1 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-11 h-11 bg-blue-light-6 rounded-full flex items-center justify-center border border-blue-light-4">
                          <span className="text-custom-sm font-bold text-blue-dark">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-custom-sm font-bold text-dark">
                            {user.name || 'Anonymous User'}
                          </div>
                          <div className="text-custom-xs text-body font-medium italic">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider border ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-light-6 text-red-dark border-red-light-4' 
                          : 'bg-green-light-6 text-green-dark border-green-light-4'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-custom-sm font-bold text-dark">{user.orders.length}</span>
                        <span className="text-custom-xs text-body">purchases</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-custom-sm font-bold text-dark">
                        ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-custom-sm text-body font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <UserActions user={user} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}