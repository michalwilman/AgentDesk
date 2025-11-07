import { checkAdminAccess } from '@/lib/admin/check-admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UsageStatsTable } from '@/components/admin/usage-stats-table'

export default async function AdminUsagePage() {
  await checkAdminAccess()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Communication Usage
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor message usage and costs across all customers
        </p>
      </div>

      {/* Usage Stats Table */}
      <UsageStatsTable />
    </div>
  )
}

