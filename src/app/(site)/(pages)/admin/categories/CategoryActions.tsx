// app/admin/categories/CategoryActions.tsx
"use client";

import { useState } from "react";
import { Edit2, Trash2, MoreVertical, X } from "lucide-react";
import { deleteCategory, updateCategory } from "../../../../../../lib/category.actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || ""
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateCategory(category.id, formData);
      toast.success('Category updated successfully');
      setShowEditModal(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (category.products.length > 0) {
      toast.error(`Cannot delete category with ${category.products.length} products`);
      return;
    }

    // Using toast for confirmation or standard confirm - here we trigger logic
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    setLoading(true);
    try {
      await deleteCategory(category.id);
      toast.success('Category deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="font-euclid-circular-a">
      {/* Actions Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 rounded-lg hover:bg-gray-2 text-dark-5 hover:text-dark transition-all"
          disabled={loading}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-4 border border-gray-3 z-20 overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-custom-sm font-bold text-dark hover:bg-gray-1 rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4 text-blue" />
                  Edit Details
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowDropdown(false);
                  }}
                  disabled={category.products.length > 0}
                  className="flex items-center gap-3 w-full px-4 py-3 text-custom-sm font-bold text-red hover:bg-red-light-6 rounded-xl transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Category
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => !loading && setShowEditModal(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-4 border border-gray-3 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-2 flex items-center justify-between bg-gray-1/30">
              <div>
                <h2 className="text-heading-6 font-bold text-dark">Edit Category</h2>
                <p className="text-custom-xs text-body italic">Modify category identification</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-dark-5" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-8 space-y-6">
              <div>
                <label className="block text-2xs font-bold text-dark-5 uppercase tracking-widest mb-2 ml-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-1 border border-gray-3 rounded-xl px-4 py-3 text-custom-sm font-medium text-dark focus:bg-white focus:border-blue focus:ring-4 focus:ring-blue/5 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-2xs font-bold text-dark-5 uppercase tracking-widest mb-2 ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-1 border border-gray-3 rounded-xl px-4 py-3 text-custom-sm font-medium text-dark focus:bg-white focus:border-blue focus:ring-4 focus:ring-blue/5 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3.5 bg-gray-2 hover:bg-gray-3 text-dark font-bold rounded-xl transition-all"
                  disabled={loading}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="flex-1 px-6 py-3.5 bg-blue hover:bg-blue-dark text-white font-bold rounded-xl shadow-lg shadow-blue/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}