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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (productId: string, productTitle: string) => {
    setProductToDelete({ id: productId, title: productTitle });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await deleteProduct(productToDelete.id);
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || product.status === filterStatus.toUpperCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return 0;
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "stock-asc": return a.stock - b.stock;
        case "stock-desc": return b.stock - a.stock;
        case "name-asc": return a.title.localeCompare(b.title);
        case "name-desc": return b.title.localeCompare(a.title);
        default: return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-meta font-euclid-circular-a">
  <div className="flex flex-col items-center justify-center">
    <div className="relative flex h-12 w-12 mb-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
      <span className="relative inline-flex rounded-full h-12 w-12 bg-blue opacity-20 items-center justify-center">
        {/* Optional: Small inner dot or icon */}
        <div className="h-3 w-3 bg-blue rounded-full"></div>
      </span>
    </div>
    <p className="text-custom-sm text-dark-5 font-medium">Fetching inventory...</p>
  </div>
</div>
    );
  }

  // Stats Calculation
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const lowStockProducts = products.filter((p) => p.stock <= 10).length;
  const totalVariants = products.reduce((sum, p) => sum + p._count.variants, 0);

  return (
    <div className="min-h-screen bg-meta p-6 font-euclid-circular-a">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-heading-4 font-bold text-dark mb-2">Product Management</h1>
            <p className="text-custom-sm text-body">
              Monitor inventory, track performance, and manage catalog entries.
            </p>
          </div>
          <Link
            href="/admin/products/add"
            className="px-6 py-3 bg-blue text-white rounded-xl font-bold text-custom-sm shadow-2 hover:bg-blue-dark transition-all flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Create Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Inventory", value: totalProducts, color: "text-blue" },
            { label: "Active Listings", value: activeProducts, color: "text-green-dark" },
            { label: "Low Stock Alerts", value: lowStockProducts, color: "text-red-dark" },
            { label: "Total Variants", value: totalVariants, color: "text-dark" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-3 shadow-1">
              <p className="text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">{stat.label}</p>
              <p className={`text-heading-4 font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-6 rounded-xl border border-gray-3 shadow-1 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Search Catalog</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, brand, or model..."
                className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg text-custom-sm font-medium text-dark focus:ring-1 focus:ring-blue outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Status Filter</label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg text-custom-sm font-medium text-dark focus:ring-1 focus:ring-blue outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-5">▼</div>
              </div>
            </div>
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Sort Order</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg text-custom-sm font-medium text-dark focus:ring-1 focus:ring-blue outline-none appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="stock-asc">Stock (Low to High)</option>
                  <option value="stock-desc">Stock (High to Low)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-5">▼</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-3 shadow-1 overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-1 border-b border-gray-2">
                  <tr>
                    <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Variants</th>
                    <th className="px-6 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-2xs font-bold text-dark-5 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-2">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-1/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-lg border border-gray-3 overflow-hidden bg-white flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = "/images/placeholder.png"; }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-custom-sm font-bold text-dark group-hover:text-blue transition-colors">{product.title}</div>
                            {(product.brand || product.model) && (
                              <div className="text-xs text-body">
                                {product.brand} {product.model}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider bg-gray-1 border border-gray-2 rounded-md text-dark-5">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-custom-sm font-bold text-dark">${product.price.toFixed(2)}</div>
                        {product.discount && product.discount > 0 && (
                          <span className="text-2xs font-bold text-green-dark bg-green-light-6 px-1.5 py-0.5 rounded">
                            {product.discount}% OFF
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-custom-sm font-bold ${
                          product.stock <= 5 ? "text-red-dark" : 
                          product.stock <= 10 ? "text-orange-dark" : "text-green-dark"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-custom-sm font-medium bg-blue-light-5 text-blue-dark px-2 py-1 rounded-md border border-blue-light-4">
                          {product._count.variants}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider ${
                          product.status === "ACTIVE" ? "bg-green-light-6 text-green-dark border border-green-light-4" :
                          product.status === "INACTIVE" ? "bg-orange-light-6 text-orange-dark border border-orange-light-4" :
                          "bg-red-light-6 text-red-dark border border-red-light-4"
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/admin/products/${product.id}/edit`} className="text-custom-sm font-bold text-blue hover:text-blue-dark transition-colors">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product.id, product.title)}
                            className="text-custom-sm font-bold text-red hover:text-red-dark transition-colors"
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
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-1 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📦</div>
              <p className="text-heading-6 font-bold text-dark mb-2">No products found</p>
              <p className="text-custom-sm text-body mb-6">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your filters to find what you're looking for." 
                  : "Get started by adding your first product to the inventory."}
              </p>
              {!(searchTerm || filterStatus !== "all") && (
                <Link
                  href="/admin/products/add"
                  className="inline-block px-8 py-3 bg-blue text-white rounded-xl font-bold shadow-2 hover:bg-blue-dark transition-all"
                >
                  Add First Product
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination / Count */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 text-center text-custom-xs font-bold text-dark-5 uppercase tracking-widest">
            Showing {filteredProducts.length} of {products.length} records
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-dark/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-3 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-light-6 text-red">
                <svg
                  className="fill-current"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>

              <h3 className="mb-2 text-heading-6 font-bold text-dark">Confirm Deletion</h3>
              <p className="mb-2 text-custom-sm text-dark font-bold">
                {productToDelete.title}
              </p>
              <p className="mb-8 text-custom-sm text-dark-4">
                This will permanently delete this product and all its variants. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  disabled={deleting}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 rounded-xl border border-gray-3 py-3 text-custom-sm font-bold text-dark hover:bg-gray-2 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 flex items-center justify-center rounded-xl bg-red py-3 text-custom-sm font-bold text-white hover:bg-red-dark shadow-2 transition-all disabled:bg-red/70"
                >
                  {deleting ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}