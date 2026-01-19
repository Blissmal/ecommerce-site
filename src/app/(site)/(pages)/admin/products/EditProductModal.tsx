// "use client";

// import { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { getAllCategories } from "../../../../../../lib/category.actions";
// import { updateProduct } from "../../../../../../lib/product.action";
// import ImageUpload from "@/components/Common/ImageUpload";

// interface Product {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
//   stock: number;
//   imageUrl: string | null;
//   images?: string[];
//   categoryId: string | null;
//   discount?: number | null;
// }

// export default function EditProductModal({ product, onClose }: { product: Product; onClose: () => void; }) {
//   const [form, setForm] = useState({
//     title: product.title,
//     description: product.description,
//     price: product.price.toString(),
//     stock: product.stock.toString(),
//     imageUrl: product.imageUrl || "",
//     images: product.images || [],
//     categoryId: product.categoryId || "",
//     discount: product.discount ? product.discount.toString() : "",
//   });
  
//   const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchCategories() {
//       try {
//         const data = await getAllCategories();
//         setCategories(data);
//       } catch (error) {
//         toast.error("Failed to fetch categories");
//       }
//     }
//     fetchCategories();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await updateProduct(product.id, {
//         title: form.title,
//         description: form.description,
//         price: form.price,
//         stock: form.stock,
//         imageUrl: form.imageUrl,
//         images: form.images.filter(url => url && url.trim() !== ""),
//         categoryId: form.categoryId,
//         discount: form.discount || undefined,
//       });
      
//       toast.success("Update successful");
//       router.refresh();
//       onClose();
//     } catch (error) {
//       console.error(error);
//       toast.error("Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-euclid-circular-a">
//       <div className="bg-white rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2 border border-gray-3">
        
//         {/* Modal Header */}
//         <div className="px-8 py-6 border-b border-gray-200 bg-gray-1 flex items-center justify-between">
//           <div>
//             <span className="text-2xs font-bold text-blue uppercase tracking-widest">Editor</span>
//             <h3 className="text-heading-6 font-bold text-dark">Modify Product</h3>
//           </div>
//           <button 
//             type="button"
//             onClick={onClose} 
//             className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-3 text-body hover:bg-gray-2 transition-all"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Modal Content */}
//         <form onSubmit={handleSubmit} className="overflow-y-auto p-8 flex-1 grid grid-cols-1 lg:grid-cols-5 gap-10">
//           <div className="lg:col-span-3 space-y-6">
//             <div>
//               <label className="block text-2xs font-bold text-dark-4 uppercase mb-2 ml-1">Title</label>
//               <input 
//                 name="title" 
//                 value={form.title} 
//                 onChange={handleChange} 
//                 className="w-full p-4 bg-gray-1 border-none rounded-2xl text-dark font-medium focus:ring-2 focus:ring-blue/20 outline-none" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-2xs font-bold text-dark-4 uppercase mb-2 ml-1">Description</label>
//               <textarea 
//                 name="description" 
//                 value={form.description} 
//                 onChange={handleChange} 
//                 rows={5} 
//                 className="w-full p-4 bg-gray-1 border-none rounded-2xl text-dark font-medium resize-none focus:ring-2 focus:ring-blue/20 outline-none" 
//                 required 
//               />
//             </div>

//             {/* Additional Images Gallery */}
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <label className="block text-2xs font-bold text-dark-4 uppercase">Additional Images</label>
//                 <span className="text-2xs text-dark-5">
//                   {form.images.length} / 10 images
//                 </span>
//               </div>
//               <ImageUpload
//                 id="edit-gallery-upload" // Unique ID
//                 value={form.images}
//                 onChange={(urls) => setForm(prev => ({ ...prev, images: urls }))}
//                 maxImages={10}
//               />
//             </div>
//           </div>

//           <div className="lg:col-span-2 space-y-6">
//             {/* Hero Image */}
//             <div className="p-6 bg-meta rounded-[2rem] border border-gray-3">
//               <label className="block text-center text-2xs font-bold text-dark-4 uppercase mb-4">Hero Media</label>
//               <ImageUpload 
//                 id="edit-hero-upload" // Unique ID
//                 value={form.imageUrl ? [form.imageUrl] : []} 
//                 onChange={(urls) => setForm(prev => ({ ...prev, imageUrl: urls[0] || "" }))} 
//                 maxImages={1}
//               />
//             </div>

//             {/* Pricing & Inventory */}
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-2xs font-bold text-dark-4 uppercase mb-2 ml-1">Price</label>
//                   <input 
//                     name="price" 
//                     type="number" 
//                     step="0.01"
//                     value={form.price} 
//                     onChange={handleChange} 
//                     className="w-full p-3 bg-gray-1 border-none rounded-xl text-dark font-bold focus:ring-2 focus:ring-blue/20 outline-none" 
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-2xs font-bold text-dark-4 uppercase mb-2 ml-1">Stock</label>
//                   <input 
//                     name="stock" 
//                     type="number" 
//                     value={form.stock} 
//                     onChange={handleChange} 
//                     className="w-full p-3 bg-gray-1 border-none rounded-xl text-dark font-bold focus:ring-2 focus:ring-blue/20 outline-none" 
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-2xs font-bold text-dark-4 uppercase mb-2 ml-1">Discount (%)</label>
//                 <input 
//                   name="discount" 
//                   type="number" 
//                   value={form.discount} 
//                   onChange={handleChange} 
//                   className="w-full p-3 bg-green-light-6 border border-green-light-4 rounded-xl text-green-dark font-bold outline-none" 
//                   placeholder="0"
//                 />
//               </div>
//               <div>
//                 <label className="block text-2xs font-bold text-dark-4 uppercase mb-2 ml-1">Category</label>
//                 <select 
//                   name="categoryId" 
//                   value={form.categoryId} 
//                   onChange={handleChange} 
//                   className="w-full p-3 bg-gray-1 border-none rounded-xl text-dark font-bold outline-none focus:ring-2 focus:ring-blue/20"
//                   required
//                 >
//                   <option value="">Select a category</option>
//                   {categories.map(c => (
//                     <option key={c.id} value={c.id}>{c.name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </form>

//         {/* Modal Footer */}
//         <div className="p-8 border-t border-gray-2 flex gap-4 bg-white">
//           <button 
//             type="button" 
//             onClick={onClose} 
//             className="flex-1 py-4 bg-gray-2 text-dark font-bold rounded-2xl hover:bg-gray-3 transition-all"
//           >
//             Cancel
//           </button>
//           <button 
//             type="submit" // Changed to type="submit" to link with form
//             onClick={handleSubmit} 
//             disabled={loading} 
//             className="flex-[2] py-4 bg-blue text-white font-bold rounded-2xl shadow-2 hover:bg-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }