// // app/admin/products/ProductActions.tsx
// "use client";

// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { deleteProduct } from "../../../../../../lib/product.action";
// import EditProductModal from "./EditProductModal";

// interface Product {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
//   stock: number;
//   imageUrl: string | null;
//   categoryId: string | null;
// }

// export default function ProductActions({ product }: { product: Product }) {
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleDelete = async () => {
//     setLoading(true);
//     try {
//       await deleteProduct(product.id);
//       toast.success("Product deleted successfully");
//       router.refresh();
//       setShowDeleteConfirm(false);
//     } catch (error) {
//       toast.error("Failed to delete product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center space-x-4 font-euclid-circular-a">
//       {/* Row Action Buttons */}
//       <button
//         onClick={() => setShowEditModal(true)}
//         className="text-blue hover:text-blue-dark text-custom-sm font-bold transition-colors"
//       >
//         Edit
//       </button>
      
//       <button
//         onClick={() => setShowDeleteConfirm(true)}
//         className="text-red-dark hover:text-red text-custom-sm font-bold transition-colors"
//       >
//         Delete
//       </button>

//       {/* Edit Modal */}
//       {showEditModal && (
//         <EditProductModal
//           product={product}
//           onClose={() => setShowEditModal(false)}
//         />
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
//           {/* Backdrop using your 'dark' color with opacity */}
//           <div 
//             className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
//             onClick={() => !loading && setShowDeleteConfirm(false)}
//           />
          
//           <div className="relative bg-white rounded-2xl shadow-4 border border-gray-3 p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
//             <div className="flex flex-col items-center text-center">
//               {/* Danger Icon */}
//               <div className="w-16 h-16 bg-red-light-6 rounded-full flex items-center justify-center mb-5">
//                 <span className="text-red-dark text-2xl font-bold">!</span>
//               </div>
              
//               <h3 className="text-heading-5 font-bold text-dark mb-2">
//                 Delete Product
//               </h3>
//               <p className="text-custom-sm text-body mb-8">
//                 Are you sure you want to delete <span className="font-bold text-dark">"{product.title}"</span>? 
//                 This action is permanent and cannot be undone.
//               </p>
              
//               <div className="flex w-full gap-3">
//                 <button
//                   onClick={() => setShowDeleteConfirm(false)}
//                   disabled={loading}
//                   className="flex-1 px-6 py-3 bg-gray-2 hover:bg-gray-3 text-dark font-bold rounded-xl transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   disabled={loading}
//                   className="flex-1 px-6 py-3 bg-red hover:bg-red-dark text-white font-bold rounded-xl shadow-lg shadow-red/20 transition-all disabled:opacity-50"
//                 >
//                   {loading ? "Deleting..." : "Delete"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }