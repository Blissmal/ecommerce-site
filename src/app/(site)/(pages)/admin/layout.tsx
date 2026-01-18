// app/admin/layout.tsx
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import AdminShell from "./AdminShell";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await stackServerApp.getUser();

  // Authentication Check
  if (!user) {
    return redirect("/handler/signin?redirect_url=/admin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  // Authorization Check (Role-based)
  if (!dbUser || dbUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-meta font-euclid-circular-a p-6">
        <div className="max-w-md w-full bg-white shadow-4 rounded-2xl border border-gray-3 p-10 text-center animate-in fade-in zoom-in duration-300">
          {/* Security Icon */}
          <div className="w-20 h-20 bg-red-light-6 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-light-4">
            <svg className="w-10 h-10 text-red-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9a3 3 0 013-3m3 3a3 3 0 01-3 3h-3" />
            </svg>
          </div>

          <h1 className="text-heading-4 font-bold text-dark mb-3">Access Denied</h1>
          
          <p className="text-custom-sm text-body mb-8 leading-relaxed">
            You are currently signed in as <span className="font-bold text-dark">{dbUser?.email || user.primaryEmail}</span>, 
            but you do not have the <span className="text-red-dark font-bold">ADMIN</span> permissions required to view this area.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full bg-blue hover:bg-blue-dark text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-blue/20 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Storefront
            </Link>
            
            <Link
              href="/handler/signout"
              className="w-full bg-gray-2 hover:bg-gray-3 text-dark font-bold px-6 py-3.5 rounded-xl transition-all"
            >
              Switch Account
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-2">
            <p className="text-2xs font-bold text-dark-5 uppercase tracking-widest">
              Security Protocol v2.4
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}