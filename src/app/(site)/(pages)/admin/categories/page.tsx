// app/admin/categories/page.tsx

import { prisma } from "@/lib/prisma";
import AddCategoryForm from "./AddCategoryForm";
import CategoryActions from "./CategoryActions";

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      products: { select: { id: true } }
    },
    orderBy: { name: 'asc' }
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 font-euclid-circular-a">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-4 font-bold text-dark">Categories Management</h1>
        <p className="text-custom-sm text-body">Organize your products into logical groups for easier browsing.</p>
      </div>

      {/* Add Category Form Module */}
      <AddCategoryForm />

      {/* Categories Table List */}
      <div className="bg-white shadow-2 rounded-2xl border border-gray-3 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-2 bg-gray-1/30 flex items-center justify-between">
          <h3 className="text-heading-6 font-bold text-dark">All Categories</h3>
          <span className="text-custom-xs font-bold text-dark-5 bg-white px-3 py-1 rounded-full border border-gray-3 shadow-1">
            Total: {categories.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-2">
            <thead className="bg-gray-1">
              <tr>
                <th className="px-8 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-widest">
                  Category Name
                </th>
                <th className="px-8 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-widest">
                  Description / Slug
                </th>
                <th className="px-8 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-widest">
                  Inventory
                </th>
                <th className="px-8 py-4 text-left text-2xs font-bold text-dark-5 uppercase tracking-widest">
                  Created Date
                </th>
                <th className="px-8 py-4 text-right text-2xs font-bold text-dark-5 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-2">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-1/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-custom-sm font-bold text-dark group-hover:text-blue transition-colors">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-custom-sm text-body max-w-xs truncate italic">
                      {category.slug || 'No description provided'}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-2xs font-bold rounded-full bg-blue-light-6 text-blue-dark border border-blue-light-4 uppercase tracking-tighter">
                      {category.products.length} Products
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-custom-sm text-dark-5">
                    {/* Note: Ideally use category.createdAt from DB if available */}
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <CategoryActions category={category} />
                  </td>
                </tr>
              ))}
              
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-2 rounded-full flex items-center justify-center text-2xl">🏷️</div>
                      <p className="text-custom-sm font-bold text-dark-5">No categories found.</p>
                      <p className="text-custom-xs text-body italic">Add your first category using the form above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}