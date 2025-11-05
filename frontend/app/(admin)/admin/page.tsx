import { checkAdminAccess } from '@/lib/admin/check-admin'
import { AdminStats } from '@/components/admin/admin-stats'
import { AdminRecentActivity } from '@/components/admin/admin-recent-activity'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Bot, MessageSquare, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const adminUser = await checkAdminAccess()

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Welcome back, {adminUser.full_name || adminUser.email}
        </p>
      </div>

      {/* Stats Overview */}
      <AdminStats />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-blue-500" />
              Manage Users
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              View and manage all system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/users" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Go to Users →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Bot className="h-5 w-5 text-emerald-500" />
              System Bots
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              View all bots in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/bots" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Go to Bots →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Audit Logs
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              View system activity and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/audit-logs" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Go to Logs →
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <AdminRecentActivity />
    </div>
  )
}

