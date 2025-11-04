'use client'

import { useState, useEffect } from 'react'

interface TrialStatus {
  is_trial: boolean
  status: 'active' | 'expired'
  trial_start?: string
  trial_end?: string
  days_remaining?: number
  hours_remaining?: number
  payment_method_added?: boolean
  reminder_sent?: boolean
  message?: string
  plan?: string
}

export function useTrialStatus() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrialStatus()
  }, [])

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trial/status`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trial status')
      }

      const data = await response.json()
      setTrialStatus(data)
    } catch (error) {
      console.error('Error fetching trial status:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    trialStatus,
    loading,
    refetch: fetchTrialStatus,
  }
}

