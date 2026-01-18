// app/admin/products/page.tsx

import Link from "next/link";
import { prisma } from "../../../../../../lib/prisma";
import ProductActions from "./ProductActions";

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      orderItems: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-meta p-7.5 font-euclid-circular-a">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-heading-4 font-bold text-dark">Products Management</h1>
          <p className="text-custom-sm text-body">Manage your inventory, pricing, and categories.</p>
        </div>
        <Link
          href="/admin/add-product"
          className="bg-blue hover:bg-blue-dark text-white px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-custom-sm flex items-center gap-2"
        >
          <span className="text-lg">＋</span> Add New Product
        </Link>
      </div>

      <div className="bg-white shadow-2 rounded-xl border border-gray-3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-3">
            <thead className="bg-gray-1">
              <tr>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Product Details
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-2">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-1 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-2 rounded-lg overflow-hidden flex-shrink-0 border border-gray-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-custom-sm font-bold text-dark">
                          {product.title}
                        </div>
                        <div className="text-custom-xs text-body truncate max-w-[200px]">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider bg-blue-light-5 text-blue-dark border border-blue-light-4">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-custom-sm font-bold text-dark">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-custom-sm font-bold ${
                        product.stock > 10 ? 'text-green-dark' : 
                        product.stock > 0 ? 'text-yellow-dark' : 'text-red-dark'
                      }`}>
                        {product.stock} in stock
                      </span>
                      <div className="w-24 h-1.5 bg-gray-2 rounded-full mt-1.5 overflow-hidden">
                         <div 
                          className={`h-full rounded-full ${
                            product.stock > 10 ? 'bg-green' : 
                            product.stock > 0 ? 'bg-yellow' : 'bg-red'
                          }`}
                          style={{ width: `${Math.min(product.stock * 2, 100)}%` }}
                         />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-custom-sm text-body font-medium">
                    <span className="text-dark font-bold">{product.orderItems.length}</span> units sold
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <ProductActions product={product} />
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