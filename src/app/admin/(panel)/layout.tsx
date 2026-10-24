import AdminNav from "@/components/admin/AdminNav";

/**
 * Shell for every admin page. Access is enforced by src/middleware.ts,
 * which redirects unauthenticated visitors to /admin/login.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-void">
      <AdminNav />
      <main className="min-w-0 flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
