'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoleBadge } from '@/components/admin/role-badge'
import { Shield, UserCog, Plus, Settings } from 'lucide-react'
import { getAllUsers } from '@/lib/admin/admin-api'

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'super_admin'
  created_at: string
}

export default function SettingsPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  async function fetchAdminUsers() {
    setLoading(true)
    try {
      const response = await getAllUsers({ limit: 1000, offset: 0 })
      
      // Filter only admin and super_admin users
      const admins = response.users.filter(
        u => u.role === 'admin' || u.role === 'super_admin'
      ) as AdminUser[]
      
      setAdminUsers(admins)
    } catch (error) {
      console.error('Failed to fetch admin users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-gray-500 mt-2">Manage system configuration and administrators</p>
      </div>

      {/* Admin Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Administrator Accounts
              </CardTitle>
              <CardDescription className="mt-2">
                Users with elevated permissions to manage the system
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                const email = prompt('Enter email of user to promote to admin:')
                if (email) {
                  alert('To promote a user, go to the Users page and use the role change action.')
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No administrators found</div>
          ) : (
            <div className="space-y-3">
              {adminUsers.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-purple-50">
                      <UserCog className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">{admin.full_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Added {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <RoleBadge role={admin.role} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Settings (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            System Configuration
          </CardTitle>
          <CardDescription>
            General system settings and configuration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>System configuration options will be available here</p>
            <p className="text-sm mt-2">Coming soon...</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-600" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Security and access control configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">Require 2FA for admin accounts</div>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Session Timeout</div>
                <div className="text-sm text-gray-500">Automatic logout after inactivity</div>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">IP Whitelist</div>
                <div className="text-sm text-gray-500">Restrict admin access by IP address</div>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

