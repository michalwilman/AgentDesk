import { createClient } from '@/lib/supabase/client'

export interface TrialStatus {
  hasAccess: boolean
  isOnTrial: boolean
  trialExpired: boolean
  daysRemaining: number | null
  subscriptionTier: string
  subscriptionStatus: string
  trialEndDate: string | null
}

/**
 * Check if user's trial has expired and they need to upgrade
 * Returns trial status information
 */
export async function checkTrialStatus(userId?: string): Promise<TrialStatus> {
  const supabase = createClient()
  
  try {
    // Get current user if userId not provided
    let targetUserId = userId
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }
      targetUserId = user.id
    }

    // Fetch user data from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, trial_start_date, trial_end_date')
      .eq('id', targetUserId)
      .single()

    if (error || !userData) {
      console.error('Error fetching user data:', error)
      // Default to no access if can't fetch data
      return {
        hasAccess: false,
        isOnTrial: false,
        trialExpired: true,
        daysRemaining: null,
        subscriptionTier: 'free',
        subscriptionStatus: 'expired',
        trialEndDate: null
      }
    }

    const now = new Date()
    const trialEndDate = userData.trial_end_date ? new Date(userData.trial_end_date) : null
    
    // Calculate days remaining
    let daysRemaining: number | null = null
    if (trialEndDate) {
      const timeRemaining = trialEndDate.getTime() - now.getTime()
      daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
      // Don't show negative days
      if (daysRemaining < 0) daysRemaining = 0
    }

    // Check if user has paid subscription
    const hasPaidSubscription = userData.subscription_tier !== 'free'

    // Check if trial has expired
    const trialExpired = 
      !hasPaidSubscription && 
      trialEndDate !== null && 
      now > trialEndDate

    // User has access if:
    // 1. They have a paid subscription, OR
    // 2. They are on trial and trial hasn't expired
    const hasAccess = 
      hasPaidSubscription || 
      (userData.subscription_status === 'trial' && !trialExpired) ||
      userData.subscription_status === 'active'

    // If trial expired, update status in database
    if (trialExpired && userData.subscription_status === 'trial') {
      await supabase
        .from('users')
        .update({ subscription_status: 'expired' })
        .eq('id', targetUserId)
    }

    return {
      hasAccess,
      isOnTrial: userData.subscription_status === 'trial' && !trialExpired,
      trialExpired,
      daysRemaining,
      subscriptionTier: userData.subscription_tier,
      subscriptionStatus: trialExpired ? 'expired' : userData.subscription_status,
      trialEndDate: userData.trial_end_date
    }
  } catch (error) {
    console.error('Error checking trial status:', error)
    return {
      hasAccess: false,
      isOnTrial: false,
      trialExpired: true,
      daysRemaining: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'error',
      trialEndDate: null
    }
  }
}

/**
 * Initialize trial for a new user
 * Sets trial_start_date and trial_end_date (7 days from now)
 */
export async function initializeTrial(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    const { error } = await supabase
      .from('users')
      .update({
        trial_start_date: now.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        subscription_status: 'trial',
        subscription_tier: 'free'
      })
      .eq('id', userId)

    if (error) {
      console.error('Error initializing trial:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error initializing trial:', error)
    return false
  }
}

/**
 * Format trial end date in a human-readable way
 */
export function formatTrialEndDate(trialEndDate: string | null): string {
  if (!trialEndDate) return 'Unknown'
  
  const endDate = new Date(trialEndDate)
  return endDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

