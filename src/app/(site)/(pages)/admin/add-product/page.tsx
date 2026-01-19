// // app/admin/add-product/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import { getAllCategories } from "../../../../../../lib/category.actions";
// import { addProduct } from "../../../../../../lib/product.action";
// import Link from "next/link";
// import ImageUpload from "@/components/Common/ImageUpload";

// interface Category {
//   id: string;
//   name: string;
// }

// export default function AddProductPage() {
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     price: "",
//     stock: "",
//     imageUrl: "",
//     images: [] as string[], // Changed to array
//     categoryId: "",
//     discount: "",
//   });
  
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchCategories() {
//       try {
//         const categoriesData = await getAllCategories();
//         setCategories(categoriesData);
//       } catch (error) {
//         toast.error("Failed to fetch categories");
//       }
//     }
//     fetchCategories();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // Validate that we have at least one image
//       if (!form.imageUrl) {
//         toast.error("Please upload a hero image");
//         setLoading(false);
//         return;
//       }

//       await addProduct({
//         title: form.title,
//         description: form.description,
//         price: form.price,
//         stock: form.stock,
//         imageUrl: form.imageUrl,
//         images: form.images,
//         categoryId: form.categoryId,
//         discount: form.discount,
//       });
      
//       toast.success("Product created successfully");
//       router.push("/admin/products");
//       router.refresh();
//     } catch (error) {
//       console.error("Error adding product:", error);
//       toast.error("Failed to add product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-meta p-6 font-euclid-circular-a">
//       <div className="max-w-6xl mx-auto">
//         <header className="mb-8 flex justify-between items-end">
//           <div>
//             <h1 className="text-heading-4 font-bold text-dark mb-2">Create New Product</h1>
//             <p className="text-custom-sm text-body">Manage your store inventory by adding high-quality assets.</p>
//           </div>
//           <Link href="/admin/products" className="text-custom-sm font-medium text-blue hover:text-blue-dark transition-colors">
//             &larr; Back to Products
//           </Link>
//         </header>

//         <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-7.5">
//           {/* Main Info Column */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white p-7.5 rounded-xl border border-gray-3 shadow-1">
//               <h2 className="text-custom-lg font-bold text-dark mb-6">General Information</h2>
//               <div className="space-y-4.5">
//                 <div>
//                   <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Product Title</label>
//                   <input
//                     name="title"
//                     value={form.title}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg focus:ring-1 focus:ring-blue outline-none text-dark transition-all"
//                     placeholder="e.g., Premium Leather Jacket"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Detailed Description</label>
//                   <textarea
//                     name="description"
//                     value={form.description}
//                     onChange={handleChange}
//                     rows={8}
//                     className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg focus:ring-1 focus:ring-blue outline-none text-dark transition-all resize-none"
//                     placeholder="Write a compelling description for your customers..."
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Additional Gallery */}
//             {/* Additional Gallery */}
// <div className="bg-white p-7.5 rounded-xl border border-gray-3 shadow-1">
//   <h2 className="text-custom-lg font-bold text-dark">Additional Gallery</h2>
//   <ImageUpload
//     id="gallery-images"
//     value={form.images}
//     onChange={(urls) => setForm(prev => ({ ...prev, images: urls }))}
//     maxImages={10} // Changed from 5 to 10
//   />
// </div>
//           </div>

//           {/* Pricing & Media Sidebar */}
//           <div className="space-y-6">
//             {/* Product Hero Image */}
// <div className="bg-white p-7.5 rounded-xl border border-gray-3 shadow-1">
//   <h2 className="text-custom-lg font-bold text-dark mb-6">Product Hero Image</h2>
//   <ImageUpload
//     id="hero-image"
//     value={form.imageUrl ? [form.imageUrl] : []}
//     onChange={(urls) => setForm(prev => ({ ...prev, imageUrl: urls[0] || "" }))}
//     maxImages={1}
//   />
// </div>

//             <div className="bg-white p-7.5 rounded-xl border border-gray-3 shadow-1 space-y-5.5">
//               <h2 className="text-custom-lg font-bold text-dark">Inventory & Pricing</h2>
//               <div>
//                 <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Price ($)</label>
//                 <input
//                   name="price"
//                   type="number"
//                   step="0.01"
//                   value={form.price}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg font-bold text-dark outline-none focus:border-blue"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Stock Quantity</label>
//                 <input
//                   name="stock"
//                   type="number"
//                   value={form.stock}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg font-bold text-dark outline-none focus:border-blue"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Discount (%)</label>
//                 <input
//                   name="discount"
//                   type="number"
//                   value={form.discount}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-green-light-6 border border-green-light-4 rounded-lg font-bold text-green-dark outline-none"
//                   placeholder="0"
//                 />
//               </div>
//               <div>
//                 <label className="block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2">Category</label>
//                 <select
//                   name="categoryId"
//                   value={form.categoryId}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-gray-1 border border-gray-3 rounded-lg text-dark font-medium outline-none focus:border-blue"
//                   required
//                 >
//                   <option value="">Select a category</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>{cat.name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 bg-blue text-white rounded-xl font-bold text-custom-lg shadow-2 hover:bg-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Publishing..." : "Publish Product"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }