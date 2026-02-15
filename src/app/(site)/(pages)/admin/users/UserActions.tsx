// app/admin/users/UserActions.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteUser, updateUserRole } from "@/lib/user.actions";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function UserActions({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: string) => {
    setLoading(true);
    try {
      await updateUserRole(user.id, newRole);
      toast.success("User role updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteUser(user.id);
      toast.success("User deleted successfully");
      router.refresh();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3 font-euclid-circular-a">
      {/* Role Selector */}
      <div className="relative">
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={loading}
          className="appearance-none bg-gray-2 border border-gray-3 text-dark text-custom-xs font-bold rounded-lg pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all cursor-pointer disabled:opacity-50"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-dark-5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="text-red-dark hover:text-red text-custom-sm font-bold transition-colors disabled:opacity-50"
      >
        Delete
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
            onClick={() => !loading && setShowDeleteConfirm(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-4 border border-gray-3 p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-red-light-6 rounded-full flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-red-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-heading-5 font-bold text-dark mb-2">
                Remove User Access
              </h3>
              <p className="text-custom-sm text-body mb-8">
                Are you sure you want to delete <span className="font-bold text-dark">{user.name || user.email}</span>? 
                This will revoke all access and remove their order history from this view.
              </p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-2 hover:bg-gray-3 text-dark font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red hover:bg-red-dark text-white font-bold rounded-xl shadow-lg shadow-red/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}