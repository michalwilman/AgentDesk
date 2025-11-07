'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminUser } from '@/lib/admin/check-admin'
import { 
  LayoutDashboard, 
  Users, 
  Bot, 
  FileText, 
  Settings,
  Shield,
  DollarSign
} from 'lucide-react'

interface AdminNavProps {
  user: AdminUser
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/bots', label: 'Bots', icon: Bot },
    { href: '/admin/usage', label: 'Usage & Costs', icon: DollarSign },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  ]

  if (user.role === 'super_admin') {
    navItems.push({ href: '/admin/settings', label: 'Settings', icon: Settings })
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      {/* Logo/Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <Shield className="h-6 w-6 text-blue-600" />
          <span>Admin Panel</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </p>
      </div>

      {/* Navigation Links */}
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Back to Dashboard Link */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to User Dashboard
        </Link>
      </div>
    </nav>
  )
}

