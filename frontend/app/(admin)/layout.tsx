import { checkAdminAccess } from '@/lib/admin/check-admin'
import { AdminNav } from '@/components/admin/admin-nav'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect non-admins automatically
  const adminUser = await checkAdminAccess()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={adminUser} />
      
      <div className="flex">
        <AdminNav user={adminUser} />
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

