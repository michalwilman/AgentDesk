'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot } from 'lucide-react'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { LanguageToggle } from '@/components/ui/language-toggle'

// Separate component for login form that uses useSearchParams
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, dir } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Get redirect URL from query params (default to /dashboard)
  const redirectUrl = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to the intended page (or dashboard if no redirect specified)
      router.push(redirectUrl)
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setError('')
      const supabase = createClient()
      
      // Include redirect URL in OAuth callback
      const callbackUrl = redirectUrl !== '/dashboard' 
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`
        : `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      })
      
      if (error) throw error
    } catch (error: any) {
      setError(error.message || `Failed to sign in with ${provider}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4" dir={dir}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-gradient-cyan p-2 rounded-xl shadow-glow">
              <Bot className="h-8 w-8 text-dark" />
            </div>
            <span className="text-3xl font-bold text-primary text-glow">AgentDesk</span>
          </Link>
          {/* Language toggle hidden for now - uncomment to restore */}
          {/* <div className="flex justify-center mb-4">
            <LanguageToggle />
          </div> */}
          <h1 className="text-2xl font-bold mb-2 text-white">{t('auth.welcomeBack')}</h1>
          <p className="text-dark-800">{t('auth.signInToAccount')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('nav.login')}</CardTitle>
            <CardDescription>{t('auth.signInToAccount')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 flex items-center justify-center gap-3 py-6 font-medium transition-smooth"
                  onClick={() => handleOAuthSignIn('google')}
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                  {t('auth.continueWithGoogle')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-none flex items-center justify-center gap-3 py-6 font-medium transition-smooth"
                  onClick={() => handleOAuthSignIn('facebook')}
                >
                  <FaFacebook className="h-5 w-5" />
                  {t('auth.continueWithFacebook')}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-dark-50 text-dark-800">{t('auth.orContinueWithEmail')}</span>
                </div>
              </div>

              <Input
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('placeholder.email')}
                required
              />

              <div className="space-y-2">
                <Input
                  label={t('auth.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('placeholder.password')}
                  required
                />
                <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-smooth"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-dark-800">{t('auth.dontHaveAccount')} </span>
              <Link href="/register" className="text-primary hover:text-primary/80 transition-smooth font-medium">
                {t('auth.signUpLink')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

