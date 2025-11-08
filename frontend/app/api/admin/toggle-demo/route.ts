import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/toggle-demo
 * Toggle demo mode on/off
 * Only accessible by admin users
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only allow admin or super_admin
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: enabled must be a boolean' },
        { status: 400 }
      )
    }

    // Update demo_mode in system_settings
    const { data, error: updateError } = await supabase
      .from('system_settings')
      .upsert({
        key: 'demo_mode',
        value: enabled,
        description: 'When enabled, payments are simulated without real transaction processing. Only admins can toggle this.',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()

    if (updateError) {
      console.error('Error updating demo_mode:', updateError)
      return NextResponse.json(
        { error: 'Failed to update demo mode' },
        { status: 500 }
      )
    }

    // Log the action in audit logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'toggle_demo_mode',
      resource_type: 'system_settings',
      resource_id: 'demo_mode',
      changes: {
        old_value: !enabled,
        new_value: enabled
      },
      metadata: {
        user_email: user.email,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      demo_mode: enabled,
      message: `Demo mode ${enabled ? 'enabled' : 'disabled'} successfully`
    })

  } catch (error) {
    console.error('Error in toggle-demo API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/toggle-demo
 * Get current demo mode status
 * Only accessible by admin users
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only allow admin or super_admin
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

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
    console.error('Error in toggle-demo GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

