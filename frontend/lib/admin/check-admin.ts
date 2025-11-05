import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'user' | 'admin' | 'super_admin'

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  full_name: string | null
}

/**
 * Check if the current user is an admin or super_admin
 * Redirects to dashboard if not authorized
 * Returns the user data if authorized
 */
export async function checkAdminAccess(): Promise<AdminUser> {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  // Get user role from database
  const { data: userData, error } = await supabase
    .from('users')
    .select('id, email, role, full_name')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    redirect('/dashboard')
  }

  // Check if user is admin or super_admin
  if (userData.role !== 'admin' && userData.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return userData as AdminUser
}

/**
 * Check if user is specifically a super_admin
 */
export async function checkSuperAdminAccess(): Promise<AdminUser> {
  const adminUser = await checkAdminAccess()

  if (adminUser.role !== 'super_admin') {
    redirect('/admin')
  }

  return adminUser
}

/**
 * Check admin access on client side (for use in Client Components)
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
      return null
    }

    return userData as AdminUser
  } catch {
    return null
  }
}

