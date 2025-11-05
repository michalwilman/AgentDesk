'use client'

import { AdminUser } from '@/lib/admin/check-admin'
import { Bell, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  user: AdminUser
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AgentDesk Admin</h1>
          <p className="text-sm text-gray-500">System Administration Panel</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

