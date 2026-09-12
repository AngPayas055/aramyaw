import AdminNavbar from "@/app/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <main>{children}</main>
    </div>
  );
}