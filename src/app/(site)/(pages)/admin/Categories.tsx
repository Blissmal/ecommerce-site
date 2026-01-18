// app/admin/_components/AddProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "../../../../../lib/product.action";
import toast from "react-hot-toast";

export default function AddProductForm({ categories }: { categories: { id: string, name: string }[] }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addProduct(form);
      toast.success("Product added successfully!");
      router.refresh();
      setForm({ title: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-gray-1 border border-gray-3 rounded-xl px-4 py-3 text-custom-sm font-medium text-dark focus:bg-white focus:border-blue focus:ring-4 focus:ring-blue/5 outline-none transition-all placeholder:text-body-dark/50";
  const labelStyles = "block text-2xs font-bold text-dark-5 uppercase tracking-widest mb-2 ml-1";

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-4xl mx-auto bg-white shadow-2 rounded-2xl border border-gray-3 overflow-hidden font-euclid-circular-a"
    >
      {/* Form Header */}
      <div className="px-8 py-6 border-b border-gray-2 border-dashed bg-gray-1/30">
        <h2 className="text-heading-5 font-bold text-dark">Create New Product</h2>
        <p className="text-custom-sm text-body mt-1">Fill in the details below to add a new item to your inventory.</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelStyles}>Product Title</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="e.g. Premium Wireless Headphones"
              className={inputStyles} 
              required 
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelStyles}>Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Describe the product features and specifications..."
              rows={4}
              className={`${inputStyles} resize-none`} 
              required 
            />
          </div>

          <div>
            <label className={labelStyles}>Price ($)</label>
            <input 
              name="price" 
              value={form.price} 
              onChange={handleChange} 
              placeholder="0.00"
              type="number" 
              step="0.01" 
              className={inputStyles} 
              required 
            />
          </div>

          <div>
            <label className={labelStyles}>Inventory Stock</label>
            <input 
              name="stock" 
              value={form.stock} 
              onChange={handleChange} 
              placeholder="0"
              type="number" 
              className={inputStyles} 
              required 
            />
          </div>

          <div>
            <label className={labelStyles}>Category</label>
            <div className="relative">
              <select 
                name="categoryId" 
                value={form.categoryId} 
                onChange={handleChange} 
                className={`${inputStyles} appearance-none cursor-pointer`} 
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-dark-5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className={labelStyles}>Main Image URL</label>
            <input 
              name="imageUrl" 
              value={form.imageUrl} 
              onChange={handleChange} 
              placeholder="https://images.com/product.jpg"
              type="text" 
              className={inputStyles} 
              required 
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="px-8 py-6 bg-gray-1 border-t border-gray-3 flex items-center justify-end gap-4">
        <button 
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-custom-sm font-bold text-dark hover:text-blue transition-colors"
        >
          Discard
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-blue hover:bg-blue-dark text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            "Publish Product"
          )}
        </button>
      </div>
    </form>
  );
}