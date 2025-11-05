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
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { LanguageToggle } from '@/components/ui/language-toggle'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, dir } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    phone?: string
    email?: string
    password?: string
  }>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [plan, setPlan] = useState<string>('starter')

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam) {
      setPlan(planParam)
    }
  }, [searchParams])

  // Validation functions
  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) {
      return t('error.fullNameRequired')
    }
    if (name.trim().length < 2) {
      return t('error.fullNameMinLength')
    }
    const nameParts = name.trim().split(' ')
    if (nameParts.length < 2) {
      return t('error.fullNameTwoWords')
    }
    if (!/^[a-zA-Zא-ת\s]+$/.test(name)) {
      return t('error.fullNameOnlyLetters')
    }
    return undefined
  }

  const validatePhone = (phoneNumber: string): string | undefined => {
    if (!phoneNumber.trim()) {
      return t('error.phoneRequired')
    }
    // Israeli phone number format: 05X-XXXXXXX or 05XXXXXXXX
    const phoneRegex = /^05[0-9][-\s]?[0-9]{7}$/
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '')
    
    if (!phoneRegex.test(phoneNumber) && !/^05[0-9]{8}$/.test(cleanPhone)) {
      return t('error.phoneInvalid')
    }
    return undefined
  }

  const validateEmail = (emailAddress: string): string | undefined => {
    if (!emailAddress.trim()) {
      return t('error.emailRequired')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      return t('error.emailInvalid')
    }
    return undefined
  }

  const validatePassword = (pass: string): string | undefined => {
    if (!pass) {
      return t('error.passwordRequired')
    }
    if (pass.length < 6) {
      return t('error.passwordMinLength')
    }
    return undefined
  }

  // Validate on blur
  const handleFullNameBlur = () => {
    const error = validateFullName(fullName)
    setFieldErrors(prev => ({ ...prev, fullName: error }))
  }

  const handlePhoneBlur = () => {
    const error = validatePhone(phone)
    setFieldErrors(prev => ({ ...prev, phone: error }))
  }

  const handleEmailBlur = () => {
    const error = validateEmail(email)
    setFieldErrors(prev => ({ ...prev, email: error }))
  }

  const handlePasswordBlur = () => {
    const error = validatePassword(password)
    setFieldErrors(prev => ({ ...prev, password: error }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate all fields
    const fullNameError = validateFullName(fullName)
    const phoneError = validatePhone(phone)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    const errors = {
      fullName: fullNameError,
      phone: phoneError,
      email: emailError,
      password: passwordError,
    }

    setFieldErrors(errors)

    // Check if there are any errors
    if (Object.values(errors).some(error => error !== undefined)) {
      setError(t('error.fixErrors'))
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Clean phone number (remove spaces and dashes)
      const cleanPhone = phone.replace(/[\s-]/g, '')
      
      // Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
            phone: cleanPhone,
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
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-8" dir={dir}>
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
          <h1 className="text-2xl font-bold mb-2 text-white">{t('auth.createAccount')}</h1>
          <p className="text-dark-800">{t('auth.getStarted')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.signUp')}</CardTitle>
            <CardDescription>{t('auth.getStarted')}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">{t('success.checkEmail')}</h3>
                  <p className="text-sm text-green-700">
                    {t('success.confirmationSent')} <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    {t('success.verifyAccount')}
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    {t('success.backToLogin')}
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
                label={`📛 ${t('auth.fullName')} *`}
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (fieldErrors.fullName) {
                    setFieldErrors(prev => ({ ...prev, fullName: undefined }))
                  }
                }}
                onBlur={handleFullNameBlur}
                placeholder={t('placeholder.fullName')}
                error={fieldErrors.fullName}
                required
              />

              <Input
                label={`📞 ${t('auth.mobileNumber')} *`}
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (fieldErrors.phone) {
                    setFieldErrors(prev => ({ ...prev, phone: undefined }))
                  }
                }}
                onBlur={handlePhoneBlur}
                placeholder={t('placeholder.phone')}
                error={fieldErrors.phone}
                required
              />

              <Input
                label={t('auth.companyName')}
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t('placeholder.companyName')}
              />

              <Input
                label={`📧 ${t('auth.email')} *`}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: undefined }))
                  }
                }}
                onBlur={handleEmailBlur}
                placeholder={t('placeholder.email')}
                error={fieldErrors.email}
                required
              />

              <Input
                label={`🔐 ${t('auth.password')} *`}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: undefined }))
                  }
                }}
                onBlur={handlePasswordBlur}
                placeholder={t('placeholder.password')}
                error={fieldErrors.password}
                required
                minLength={6}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.creatingAccount') : t('auth.createAccountButton')}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-dark-800">{t('auth.alreadyHaveAccount')} </span>
                <Link href="/login" className="text-primary hover:text-primary/80 transition-smooth font-medium">
                  {t('auth.signIn')}
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

