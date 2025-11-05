'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoleBadge } from '@/components/admin/role-badge'
import { StatusBadge } from '@/components/admin/status-badge'
import { getUserDetails, toggleUserStatus, promoteUser } from '@/lib/admin/admin-api'
import {
  User,
  Mail,
  Building,
  Calendar,
  Bot,
  MessageSquare,
  ArrowLeft,
  Power,
  UserCog,
  Clock,
  CreditCard,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface UserDetails {
  user: {
    id: string
    email: string
    full_name: string | null
    company_name: string | null
    role: 'user' | 'admin' | 'super_admin'
    subscription_tier: string
    subscription_status: string
    trial_start_date: string | null
    trial_end_date: string | null
    is_active: boolean
    created_at: string
  }
  bots: Array<{
    id: string
    name: string
    is_active: boolean
    created_at: string
  }>
  usage: {
    conversations_this_month: number
    whatsapp_messages_this_month: number
  } | null
  recentChats: Array<{
    id: string
    created_at: string
    bots: { name: string }
  }>
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [details, setDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  async function fetchUserDetails() {
    setLoading(true)
    try {
      const data = await getUserDetails(userId)
      setDetails(data)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus() {
    try {
      await toggleUserStatus(userId)
      fetchUserDetails()
    } catch (error) {
      console.error('Failed to toggle status:', error)
      alert('Failed to update user status')
    }
  }

  async function handleRoleChange() {
    const newRole = prompt('Enter new role (user/admin/super_admin):')
    if (newRole && ['user', 'admin', 'super_admin'].includes(newRole)) {
      try {
        await promoteUser(userId, newRole as any)
        fetchUserDetails()
      } catch (error) {
        console.error('Failed to change role:', error)
        alert('Failed to update user role')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">User not found</p>
        <Button onClick={() => router.push('/admin/users')} className="mt-4">
          Back to Users
        </Button>
      </div>
    )
  }

  const { user, bots, usage, recentChats } = details

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.full_name || user.email}</h1>
            <p className="text-gray-500 mt-1">User Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRoleChange}
          >
            <UserCog className="h-4 w-4 mr-2" />
            Change Role
          </Button>
          <Button
            variant={user.is_active ? 'destructive' : 'default'}
            onClick={handleToggleStatus}
          >
            <Power className="h-4 w-4 mr-2" />
            {user.is_active ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Full Name</div>
                <div className="font-medium">{user.full_name || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-medium">{user.company_name || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserCog className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Role</div>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Plan</div>
                <div className="font-medium capitalize">{user.subscription_tier}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <StatusBadge status={user.subscription_status as any} />
              </div>
            </div>
            {user.trial_start_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Trial Started</div>
                  <div className="font-medium">
                    {new Date(user.trial_start_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            {user.trial_end_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Trial Ends</div>
                  <div className="font-medium">
                    {new Date(user.trial_end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              Bots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bots.length}</div>
            <div className="text-sm text-gray-500">
              {bots.filter(b => b.is_active).length} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usage?.conversations_this_month || 0}</div>
            <div className="text-sm text-gray-500">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              WhatsApp Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usage?.whatsapp_messages_this_month || 0}</div>
            <div className="text-sm text-gray-500">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <Card>
        <CardHeader>
          <CardTitle>User's Bots</CardTitle>
        </CardHeader>
        <CardContent>
          {bots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bots created yet</div>
          ) : (
            <div className="space-y-2">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{bot.name}</div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(bot.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={bot.is_active ? 'active' : 'inactive'} size="sm" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Chats</CardTitle>
        </CardHeader>
        <CardContent>
          {recentChats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent activity</div>
          ) : (
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{chat.bots?.name || 'Unknown Bot'}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(chat.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

