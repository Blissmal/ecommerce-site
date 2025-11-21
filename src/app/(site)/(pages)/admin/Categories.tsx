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
    await addProduct(form);
    setLoading(false);
    router.refresh();
    setForm({ title: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
    toast.success("Product added successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Add New Product</h2>

      <input name="title" value={form.title} onChange={handleChange} placeholder="Title"
        className="w-full p-2 border rounded" required />

      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description"
        className="w-full p-2 border rounded" required />

      <input name="price" value={form.price} onChange={handleChange} placeholder="Price"
        type="number" step="0.01" className="w-full p-2 border rounded" required />

      <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock"
        type="number" className="w-full p-2 border rounded" required />

      <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Image URL"
        type="text" className="w-full p-2 border rounded" required />

      <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full p-2 border rounded" required>
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <button type="submit" disabled={loading} className="bg-blue-light text-white px-4 py-2 rounded hover:bg-blue-light">
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}
