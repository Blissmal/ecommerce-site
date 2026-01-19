// // app/admin/products/page.tsx

// import Link from "next/link";
// import { prisma } from "../../../../../../lib/prisma";
// import ProductActions from "./ProductActions";

// async function getProducts() {
//   return await prisma.product.findMany({
//     include: {
//       category: { select: { name: true } },
//       orderItems: { select: { id: true } }
//     },
//     orderBy: { createdAt: 'desc' }
//   });
// }

// export default async function ProductsPage() {
//   const products = await getProducts();

//   return (
//     <div className="min-h-screen bg-meta p-7.5 font-euclid-circular-a">
//       <div className="flex items-end justify-between mb-8">
//         <div>
//           <h1 className="text-heading-4 font-bold text-dark">Products Management</h1>
//           <p className="text-custom-sm text-body">Manage your inventory, pricing, and categories.</p>
//         </div>
//         <Link
//           href="/admin/add-product"
//           className="bg-blue hover:bg-blue-dark text-white px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-custom-sm flex items-center gap-2"
//         >
//           <span className="text-lg">＋</span> Add New Product
//         </Link>
//       </div>

//       <div className="bg-white shadow-2 rounded-xl border border-gray-3 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-3">
//             <thead className="bg-gray-1">
//               <tr>
//                 <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
//                   Product Details
//                 </th>
//                 <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
//                   Price
//                 </th>
//                 <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
//                   Stock Status
//                 </th>
//                 <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
//                   Performance
//                 </th>
//                 <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-2">
//               {products.map((product) => (
//                 <tr key={product.id} className="hover:bg-gray-1 transition-colors group">
//                   <td className="px-6 py-5 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="w-12 h-12 bg-gray-2 rounded-lg overflow-hidden flex-shrink-0 border border-gray-3">
//                         {product.imageUrl ? (
//                           <img
//                             src={product.imageUrl}
//                             alt={product.title}
//                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-xl">
//                             📦
//                           </div>
//                         )}
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-custom-sm font-bold text-dark">
//                           {product.title}
//                         </div>
//                         <div className="text-custom-xs text-body truncate max-w-[200px]">
//                           {product.description}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-5 whitespace-nowrap">
//                     <span className="inline-flex px-3 py-1 text-2xs font-bold rounded-full uppercase tracking-wider bg-blue-light-5 text-blue-dark border border-blue-light-4">
//                       {product.category?.name || 'Uncategorized'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-5 whitespace-nowrap text-custom-sm font-bold text-dark">
//                     ${product.price.toFixed(2)}
//                   </td>
//                   <td className="px-6 py-5 whitespace-nowrap">
//                     <div className="flex flex-col">
//                       <span className={`text-custom-sm font-bold ${
//                         product.stock > 10 ? 'text-green-dark' : 
//                         product.stock > 0 ? 'text-yellow-dark' : 'text-red-dark'
//                       }`}>
//                         {product.stock} in stock
//                       </span>
//                       <div className="w-24 h-1.5 bg-gray-2 rounded-full mt-1.5 overflow-hidden">
//                          <div 
//                           className={`h-full rounded-full ${
//                             product.stock > 10 ? 'bg-green' : 
//                             product.stock > 0 ? 'bg-yellow' : 'bg-red'
//                           }`}
//                           style={{ width: `${Math.min(product.stock * 2, 100)}%` }}
//                          />
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-5 whitespace-nowrap text-custom-sm text-body font-medium">
//                     <span className="text-dark font-bold">{product.orderItems.length}</span> units sold
//                   </td>
//                   <td className="px-6 py-5 whitespace-nowrap">
//                     <ProductActions product={product} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllProducts, deleteProduct } from "../../../../../../lib/product.action";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  brand?: string | null;
  model?: string | null;
  price: number;
  stock: number;
  discount?: number | null;
  imageUrl: string;
  status: string;
  category: {
    name: string;
  };
  _count: {
    variants: number;
    orderItems: number;
    reviews: number;
  };
  variants: Array<{
    id: string;
    price: number;
    stock: number;
    isDefault: boolean;
  }>;
}

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data as any);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"? This will also delete all its variants.`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filterStatus === "all" || product.status === filterStatus.toUpperCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return 0; // Already sorted by createdAt desc
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-asc":
          return a.stock - b.stock;
        case "stock-desc":
          return b.stock - a.stock;
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog and variants
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="newest">Newest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active Products</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter((p) => p.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.stock <= 10).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Variants</p>
          <p className="text-2xl font-bold text-blue-600">
            {products.reduce((sum, p) => sum + p._count.variants, 0)}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/placeholder.png";
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.title}
                          </div>
                          {(product.brand || product.model) && (
                            <div className="text-sm text-gray-500">
                              {product.brand} {product.model}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </div>
                      {product.discount && product.discount > 0 && (
                        <div className="text-xs text-green-600">
                          {product.discount}% off
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          product.stock <= 5
                            ? "text-red-600"
                            : product.stock <= 10
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {product._count.variants} variants
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : product.status === "INACTIVE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/shop-details/${product.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            {searchTerm || filterStatus !== "all" ? (
              <p className="text-gray-400 text-sm">
                Try adjusting your filters
              </p>
            ) : (
              <Link
                href="/admin/products/add"
                className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Your First Product
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredProducts.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}
    </div>
  );
}