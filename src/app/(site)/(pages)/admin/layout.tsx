// app/admin/layout.tsx
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return redirect("/handler/signin?redirect_url=/admin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You do not have admin permissions.</p>
        <a
          href="/"
          className="bg-blue-light text-white px-4 py-2 rounded hover:bg-blue-dark transition"
        >
          Go Back Home
        </a>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>; // client layout
}
