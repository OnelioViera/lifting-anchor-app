import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: middleware.ts already redirects unauthenticated
  // requests to /admin/login before they reach here.
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <AdminNav userEmail={user.email ?? undefined} />
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
