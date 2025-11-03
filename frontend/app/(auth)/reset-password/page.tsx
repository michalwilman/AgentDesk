'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setValidSession(true)
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    }
    
    checkSession()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-gradient-cyan p-2 rounded-xl shadow-glow">
              <Bot className="h-8 w-8 text-dark" />
            </div>
            <span className="text-3xl font-bold text-primary text-glow">AgentDesk</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 text-white">Update Password</h1>
          <p className="text-dark-800">
            {success 
              ? 'Password updated successfully!' 
              : 'Enter your new password'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Password</CardTitle>
            <CardDescription>
              {success 
                ? 'You can now sign in with your new password'
                : 'Choose a strong password for your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-600">
                    Password updated successfully!
                  </p>
                </div>
                <p className="text-sm text-dark-800 text-center">
                  Redirecting you to login page...
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              </div>
            ) : !validSession ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">
                    {error || 'Invalid or expired reset link'}
                  </p>
                </div>
                <p className="text-sm text-dark-800 text-center">
                  Please request a new password reset link.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/forgot-password')}
                >
                  Request New Link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />

                <div className="text-xs text-dark-800 space-y-1">
                  <p>Password must:</p>
                  <ul className="list-disc list-inside">
                    <li>Be at least 6 characters long</li>
                    <li>Match the confirmation</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

