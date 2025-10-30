'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot } from 'lucide-react'
import { FaGoogle, FaFacebook } from 'react-icons/fa'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [plan, setPlan] = useState<string>('starter')

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam) {
      setPlan(planParam)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Show success message - user needs to verify email
        setSuccess(true)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setError('')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            plan: plan,
          },
        },
      })
      
      if (error) throw error
    } catch (error: any) {
      setError(error.message || `Failed to sign in with ${provider}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-gradient-cyan p-2 rounded-xl shadow-glow">
              <Bot className="h-8 w-8 text-dark" />
            </div>
            <span className="text-3xl font-bold text-primary text-glow">AgentDesk</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 text-white">Create Your Account</h1>
          <p className="text-dark-800">Start building your AI assistant today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create a free account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Check your email!</h3>
                  <p className="text-sm text-green-700">
                    We've sent a confirmation link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    Click the link in the email to verify your account and get started.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
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
                    Continue with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-none flex items-center justify-center gap-3 py-6 font-medium transition-smooth"
                    onClick={() => handleOAuthSignIn('facebook')}
                  >
                    <FaFacebook className="h-5 w-5" />
                    Continue with Facebook
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-100"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-dark-50 text-dark-800">Or continue with email</span>
                  </div>
                </div>

              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />

              <Input
                label="Company Name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company"
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-dark-800">Already have an account? </span>
                <Link href="/login" className="text-primary hover:text-primary/80 transition-smooth font-medium">
                  Sign in
                </Link>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <Bot className="h-12 w-12 text-primary animate-pulse" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

