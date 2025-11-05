'use client'

import { useState, useEffect } from 'react'
import { DataTable, Column } from '@/components/admin/data-table'
import { RoleBadge } from '@/components/admin/role-badge'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, RefreshCw, Eye, UserCog, Power } from 'lucide-react'
import { getAllUsers, UserSummary, toggleUserStatus, promoteUser } from '@/lib/admin/admin-api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'trial' | 'paid' | 'inactive'>('all')
  const pageSize = 50

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, filter])

  async function fetchUsers() {
    setLoading(true)
    try {
      const response = await getAllUsers({
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        search: searchTerm || undefined,
      })

      let filteredUsers = response.users

      // Apply filters
      if (filter === 'trial') {
        filteredUsers = filteredUsers.filter(u => u.subscription_status === 'trial')
      } else if (filter === 'paid') {
        filteredUsers = filteredUsers.filter(u => u.subscription_status === 'active' && u.subscription_tier !== 'free')
      } else if (filter === 'inactive') {
        filteredUsers = filteredUsers.filter(u => !u.is_active)
      }

      setUsers(filteredUsers)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus(userId: string) {
    try {
      await toggleUserStatus(userId)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      alert('Failed to update user status')
    }
  }

  async function handleRoleChange(userId: string, newRole: 'user' | 'admin' | 'super_admin') {
    try {
      await promoteUser(userId, newRole)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to change role:', error)
      alert('Failed to update user role')
    }
  }

  const columns: Column<UserSummary>[] = [
    {
      key: 'full_name',
      label: 'Name',
      render: (user) => (
        <div>
          <div className="font-medium">{user.full_name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      key: 'subscription',
      label: 'Subscription',
      render: (user) => (
        <div>
          <div className="font-medium capitalize">{user.subscription_tier}</div>
          <StatusBadge status={user.subscription_status as any} size="sm" />
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'total_bots',
      label: 'Bots',
      render: (user) => (
        <div className="text-center font-medium">{user.total_bots}</div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (user) => (
        <div className="text-sm">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/users/${user.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newRole = prompt('Enter new role (user/admin/super_admin):')
              if (newRole && ['user', 'admin', 'super_admin'].includes(newRole)) {
                handleRoleChange(user.id, newRole as any)
              }
            }}
          >
            <UserCog className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(user.id)}
          >
            <Power className={`h-4 w-4 ${user.is_active ? 'text-green-600' : 'text-gray-400'}`} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-500 mt-2">View and manage all system users</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fetchUsers()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('all')
                setCurrentPage(1)
              }}
            >
              All Users
            </Button>
            <Button
              variant={filter === 'trial' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('trial')
                setCurrentPage(1)
              }}
            >
              Trial
            </Button>
            <Button
              variant={filter === 'paid' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('paid')
                setCurrentPage(1)
              }}
            >
              Paying
            </Button>
            <Button
              variant={filter === 'inactive' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('inactive')
                setCurrentPage(1)
              }}
            >
              Inactive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={users}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            loading={loading}
            emptyMessage="No users found"
            getRowKey={(user) => user.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}

