'use client'

import { useState, useEffect } from 'react'
import { DataTable, Column } from '@/components/admin/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Shield, UserX, UserCheck, UserCog, FileText } from 'lucide-react'
import { getAuditLogs } from '@/lib/admin/admin-api'

interface AuditLog {
  id: string
  action: string
  created_at: string
  admin: {
    email: string
    full_name: string | null
  }
  target: {
    email: string
    full_name: string | null
  } | null
  details: any
}

function getActionConfig(action: string) {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    ROLE_CHANGE: {
      label: 'Role Changed',
      color: 'text-yellow-600 bg-yellow-50',
      icon: UserCog,
    },
    USER_ACTIVATED: {
      label: 'User Activated',
      color: 'text-green-600 bg-green-50',
      icon: UserCheck,
    },
    USER_DEACTIVATED: {
      label: 'User Deactivated',
      color: 'text-red-600 bg-red-50',
      icon: UserX,
    },
  }

  return configs[action] || {
    label: action,
    color: 'text-gray-600 bg-gray-50',
    icon: FileText,
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)
  const pageSize = 100

  useEffect(() => {
    fetchLogs()
  }, [currentPage])

  async function fetchLogs() {
    setLoading(true)
    try {
      const response = await getAuditLogs({
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      })

      let filteredLogs = response.logs

      // Apply action filter
      if (filter) {
        filteredLogs = filteredLogs.filter(log => log.action === filter)
      }

      setLogs(filteredLogs)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (log) => (
        <div className="text-sm">
          <div className="font-medium">
            {new Date(log.created_at).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(log.created_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'admin',
      label: 'Admin',
      render: (log) => (
        <div>
          <div className="font-medium">{log.admin?.full_name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{log.admin?.email}</div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log) => {
        const config = getActionConfig(log.action)
        const Icon = config.icon

        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.color}`}>
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        )
      },
    },
    {
      key: 'target',
      label: 'Target User',
      render: (log) => (
        <div>
          {log.target ? (
            <>
              <div className="font-medium">{log.target.full_name || 'N/A'}</div>
              <div className="text-sm text-gray-500">{log.target.email}</div>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (log) => (
        <div className="text-sm text-gray-600">
          {log.details?.newRole && (
            <span>New Role: <span className="font-medium">{log.details.newRole}</span></span>
          )}
          {!log.details?.newRole && log.details && (
            <span>{JSON.stringify(log.details).substring(0, 50)}...</span>
          )}
          {!log.details && <span className="text-gray-400">-</span>}
        </div>
      ),
    },
  ]

  // Get unique actions for filtering
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-500 mt-2">Track all administrative actions and changes</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserCog className="h-4 w-4 text-yellow-600" />
              Role Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {logs.filter(l => l.action === 'ROLE_CHANGE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Activations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {logs.filter(l => l.action === 'USER_ACTIVATED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              Deactivations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {logs.filter(l => l.action === 'USER_DEACTIVATED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === null ? 'default' : 'outline'}
              onClick={() => {
                setFilter(null)
                setCurrentPage(1)
                fetchLogs()
              }}
            >
              All Actions
            </Button>
            {uniqueActions.map(action => {
              const config = getActionConfig(action)
              return (
                <Button
                  key={action}
                  variant={filter === action ? 'default' : 'outline'}
                  onClick={() => {
                    setFilter(action)
                    setCurrentPage(1)
                    fetchLogs()
                  }}
                >
                  {config.label}
                </Button>
              )
            })}
            <Button
              variant="outline"
              onClick={() => fetchLogs()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={logs}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            loading={loading}
            emptyMessage="No audit logs found"
            getRowKey={(log) => log.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}

