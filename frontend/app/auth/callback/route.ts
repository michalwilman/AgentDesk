import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

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
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: userData.full_name || userData.name || '',
            company_name: '',
            avatar_url: userData.avatar_url || userData.picture || null,
          },
        ])
      }

      // Redirect to dashboard on successful OAuth
      return NextResponse.redirect(new URL(next, origin))
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
          await supabase.from('users').insert([
            {
              id: user.id,
              email: user.email,
              full_name: userData.full_name || '',
              company_name: userData.company_name || '',
            },
          ])
        }
      }

      // Redirect to dashboard on successful verification
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // Redirect to error page if something went wrong
  return NextResponse.redirect(new URL('/auth/auth-error', origin))
}

