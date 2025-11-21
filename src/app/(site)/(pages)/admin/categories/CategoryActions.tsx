"use client";

import { useState } from "react";
import { Edit2, Trash2, MoreVertical } from "lucide-react";
import { deleteCategory, updateCategory } from "../../../../../../lib/category.actions";

// Note: In your actual implementation, you would import these from your server actions:

interface Category {
  id: string;
  name: string;
  description?: string;
  products: { id: string }[];
}

interface CategoryActionsProps {
  category: Category;
}

export default function CategoryActions({ category }: CategoryActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || ""
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateCategory(category.id, formData);
      setMessage({ type: 'success', text: 'Category updated successfully' });
      setShowEditModal(false);
      // In your actual app, you would refresh the data or use a state management solution
      // router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update category' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (category.products.length > 0) {
      setMessage({ type: 'error', text: `Cannot delete category with ${category.products.length} products` });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await deleteCategory(category.id);
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      // In your actual app, you would refresh the data or use a state management solution
      // router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete category' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Actions Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          disabled={loading}
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  setShowEditModal(true);
                  setShowDropdown(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Category
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDropdown(false);
                }}
                disabled={category.products.length > 0}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={category.products.length > 0 ? "Cannot delete category with products" : "Delete category"}
              >
                <Trash2 className="w-4 h-4" />
                Delete Category
              </button>
            </div>
          </div>
        )}

        {/* Backdrop to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Edit Category
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setFormData({
                        name: category.name,
                        description: category.description || ""
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={loading || !formData.name.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Category'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal backdrop */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setShowEditModal(false)}
          />
        </div>
      )}
    </>
  );
}