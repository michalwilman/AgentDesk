import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Get the correct base URL for redirects
 * In production (Railway), use X-Forwarded-Host or NEXT_PUBLIC_APP_URL
 * In development, use origin from request
 */
function getBaseUrl(request: Request): string {
  const { origin } = new URL(request.url)
  
  // Check for Railway's forwarded host header
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  
  // Fallback to NEXT_PUBLIC_APP_URL (set in Railway variables)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Last resort: use origin (works for local development)
  return origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  // Support both 'next' and 'redirect' parameters for backward compatibility
  const next = searchParams.get('redirect') ?? searchParams.get('next') ?? '/dashboard'

  const baseUrl = getBaseUrl(request)
  const supabase = createClient()

  // Handle OAuth callback (Google, Facebook, etc.)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user profile exists in users table
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id, role, is_active')
        .eq('id', data.user.id)
        .single()

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const userData = data.user.user_metadata || {}
        const now = new Date()
        const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        
        // Generate API key manually (avoiding trigger issues)
        const apiKey = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: userData.full_name || userData.name || '',
            company_name: userData.company_name || '',
            phone: userData.phone || null,
            avatar_url: userData.avatar_url || userData.picture || null,
            api_key: apiKey,
            trial_start_date: now.toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            subscription_status: 'trial',
            subscription_tier: 'starter'
          },
        ])
      }

      // Check if user is inactive (suspended)
      if (existingProfile && !existingProfile.is_active) {
        // Sign out inactive user
        await supabase.auth.signOut()
        // Redirect to login with error message
        return NextResponse.redirect(new URL('/login?error=account_suspended', baseUrl))
      }

      // Check user role and redirect accordingly
      const userRole = existingProfile?.role
      let redirectUrl = next
      
      // If user is admin/super_admin, redirect to /admin
      if (userRole === 'super_admin' || userRole === 'admin') {
        redirectUrl = '/admin'
      }

      // Redirect on successful OAuth
      return NextResponse.redirect(new URL(redirectUrl, baseUrl))
    }
  }

  // Handle email verification (OTP)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user profile exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id, role, is_active')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const userData = user.user_metadata || {}
          const now = new Date()
          const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          
          // Debug: Log user metadata to see what's available
          console.log('📱 User metadata:', JSON.stringify(userData, null, 2))
          console.log('📱 Phone from metadata:', userData.phone)
          
          // Generate API key manually (avoiding trigger issues)
          const apiKey = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
          
          const { error: insertError } = await supabase.from('users').insert([
            {
              id: user.id,
              email: user.email,
              full_name: userData.full_name || '',
              company_name: userData.company_name || '',
              phone: userData.phone || null,
              api_key: apiKey,
              trial_start_date: now.toISOString(),
              trial_end_date: trialEndDate.toISOString(),
              subscription_status: 'trial',
              subscription_tier: 'starter'
            },
          ])

          if (insertError) {
            console.error('Failed to create user profile in DB:', insertError)
            // User is still authenticated in Supabase Auth, but profile creation failed
            // This could be due to RLS policies or other DB issues
          } else {
            console.log('✅ User profile created successfully with phone:', userData.phone)
          }
        }

        // Check if user is inactive (suspended)
        if (existingProfile && !existingProfile.is_active) {
          // Sign out inactive user
          await supabase.auth.signOut()
          // Redirect to login with error message
          return NextResponse.redirect(new URL('/login?error=account_suspended', baseUrl))
        }

        // Check user role and redirect accordingly
        const userRole = existingProfile?.role
        let redirectUrl = next
        
        // If user is admin/super_admin, redirect to /admin
        if (userRole === 'super_admin' || userRole === 'admin') {
          redirectUrl = '/admin'
        }

        // Redirect on successful verification
        return NextResponse.redirect(new URL(redirectUrl, baseUrl))
      }
    }
  }

  // Redirect to error page if something went wrong
  return NextResponse.redirect(new URL('/auth/auth-error', baseUrl))
}

