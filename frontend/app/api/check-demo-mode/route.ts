import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/check-demo-mode
 * Check if demo mode is enabled
 * Public endpoint - any authenticated user can check this
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Get demo_mode from system_settings
    const { data: setting, error: settingError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'demo_mode')
      .single()

    if (settingError) {
      // If setting doesn't exist, default to true (demo mode)
      return NextResponse.json({
        demo_mode: true,
        message: 'Demo mode setting not found, defaulting to enabled'
      })
    }

    return NextResponse.json({
      demo_mode: setting.value === true || setting.value === 'true',
      success: true
    })

  } catch (error) {
    console.error('Error checking demo mode:', error)
    // Default to demo mode if there's an error
    return NextResponse.json({
      demo_mode: true,
      error: 'Error checking demo mode, defaulting to enabled'
    })
  }
}

