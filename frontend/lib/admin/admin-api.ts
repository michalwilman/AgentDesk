/**
 * Admin API Client
 * Wrapper for admin-related API calls to the backend
 */

import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface AdminStats {
  total_users: number
  active_users: number
  trial_users: number
  paid_users: number
  total_bots: number
  active_bots: number
  chats_today: number
  messages_today: number
  signups_this_week: number
  signups_this_month: number
}

export interface UserSummary {
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
  last_sign_in_at: string | null
  total_bots: number
  total_chats: number
  conversations_this_month: number
  whatsapp_messages_this_month: number
}

/**
 * Get auth headers with Supabase token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  return headers
}

/**
 * Make authenticated API request
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response
}

/**
 * Get system statistics
 */
export async function getSystemStats(): Promise<AdminStats> {
  const response = await fetchWithAuth('/admin/stats')
  return response.json()
}

/**
 * Get all users with pagination
 */
export async function getAllUsers(params: {
  limit?: number
  offset?: number
  search?: string
}): Promise<{ users: UserSummary[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())
  if (params.search) searchParams.set('search', params.search)

  const response = await fetchWithAuth(`/admin/users?${searchParams.toString()}`)
  return response.json()
}

/**
 * Get user details
 */
export async function getUserDetails(userId: string): Promise<any> {
  const response = await fetchWithAuth(`/admin/users/${userId}`)
  return response.json()
}

/**
 * Promote/demote user role
 */
export async function promoteUser(
  userId: string,
  newRole: 'user' | 'admin' | 'super_admin'
): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithAuth(`/admin/users/${userId}/promote`, {
    method: 'POST',
    body: JSON.stringify({ newRole }),
  })
  return response.json()
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(
  userId: string
): Promise<{ success: boolean; isActive: boolean }> {
  const response = await fetchWithAuth(`/admin/users/${userId}/toggle-status`, {
    method: 'POST',
  })
  return response.json()
}

/**
 * Get audit logs
 */
export async function getAuditLogs(params: {
  limit?: number
  offset?: number
}): Promise<{ logs: any[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())

  const response = await fetchWithAuth(`/admin/audit-logs?${searchParams.toString()}`)
  return response.json()
}

/**
 * Get all bots with pagination
 */
export async function getAllBots(params: {
  limit?: number
  offset?: number
  search?: string
}): Promise<{ bots: any[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())
  if (params.search) searchParams.set('search', params.search)

  const response = await fetchWithAuth(`/admin/bots?${searchParams.toString()}`)
  return response.json()
}

