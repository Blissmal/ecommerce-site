// app/admin/categories/AddCategoryForm.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addCategory } from "../../../../../../lib/category.actions";

export default function AddCategoryForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addCategory(form);
      toast.success("Category added successfully");
      setForm({ name: "", description: "" });
      router.refresh();
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-gray-1 border border-gray-3 rounded-xl px-4 py-3 text-custom-sm font-medium text-dark focus:bg-white focus:border-blue focus:ring-4 focus:ring-blue/5 outline-none transition-all placeholder:text-body-dark/40";
  const labelStyles = "block text-2xs font-bold text-dark-5 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="bg-white shadow-2 rounded-2xl border border-gray-3 p-6 font-euclid-circular-a mb-8">
      <div className="mb-6">
        <h3 className="text-custom-sm font-bold text-dark">Quick Create</h3>
        <p className="text-custom-xs text-body italic">Add a new organization tag for your products.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        <div className="md:col-span-4">
          <label className={labelStyles}>
            Category Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Electronics"
            className={inputStyles}
            required
          />
        </div>

        <div className="md:col-span-5">
          <label className={labelStyles}>
            Description (Optional)
          </label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short overview of items in this group..."
            className={inputStyles}
          />
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue hover:bg-blue-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing
              </>
            ) : (
              <>
                <span className="text-lg leading-none">+</span>
                Add Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}