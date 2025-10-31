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
  const next = searchParams.get('next') ?? '/dashboard'

  const baseUrl = getBaseUrl(request)
  const supabase = createClient()

  // Handle OAuth callback (Google, Facebook, etc.)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user profile exists in users table
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const userData = data.user.user_metadata || {}
        const now = new Date()
        const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: userData.full_name || userData.name || '',
            company_name: '',
            avatar_url: userData.avatar_url || userData.picture || null,
            trial_start_date: now.toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            subscription_status: 'trial',
            subscription_tier: 'free'
          },
        ])
      }

      // Redirect to dashboard on successful OAuth
      return NextResponse.redirect(new URL(next, baseUrl))
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
          .select('id')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const userData = user.user_metadata || {}
          const now = new Date()
          const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          
          await supabase.from('users').insert([
            {
              id: user.id,
              email: user.email,
              full_name: userData.full_name || '',
              company_name: userData.company_name || '',
              trial_start_date: now.toISOString(),
              trial_end_date: trialEndDate.toISOString(),
              subscription_status: 'trial',
              subscription_tier: 'free'
            },
          ])
        }
      }

      // Redirect to dashboard on successful verification
      return NextResponse.redirect(new URL(next, baseUrl))
    }
  }

  // Redirect to error page if something went wrong
  return NextResponse.redirect(new URL('/auth/auth-error', baseUrl))
}

