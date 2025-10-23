'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, Lock, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { siteScanApi, SiteScanJob, StartSiteScanRequest } from '@/lib/api/site-scan'

interface WebsiteCrawlingTabProps {
  botId: string
  language: string
}

export default function WebsiteCrawlingTab({
  botId,
  language,
}: WebsiteCrawlingTabProps) {
  const [jobs, setJobs] = useState<SiteScanJob[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const jobsRef = useRef<SiteScanJob[]>([])
  
  // Keep ref in sync with state
  useEffect(() => {
    jobsRef.current = jobs
  }, [jobs])
  
  // Form state
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [formData, setFormData] = useState<StartSiteScanRequest>({
    botId,
    startUrlAfterLogin: '',
    loginUrl: '',
    usernameSelector: '#username',
    passwordSelector: '#password',
    submitSelector: 'button[type="submit"]',
    username: '',
    password: '',
  })

  const isHebrew = language === 'he'

  // Load jobs on mount and set up polling
  useEffect(() => {
    loadJobs()
    
    // Set up polling for active jobs (every 5 seconds)
    const interval = setInterval(() => {
      // Only poll if there are active jobs (using ref to avoid recreating interval)
      const hasActiveJobs = jobsRef.current.some(
        (job) => job.status === 'queued' || job.status === 'processing'
      )
      if (hasActiveJobs || jobsRef.current.length === 0) {
        loadJobs()
      }
    }, 5000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId])

  const loadJobs = async () => {
    try {
      // Don't show loading spinner if we're just polling
      if (jobs.length === 0) {
        setLoading(true)
      }
      
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await siteScanApi.getSiteScanJobs(botId, session.access_token)
      setJobs(response.jobs)
    } catch (err: any) {
      console.error('Failed to load jobs:', err)
      // Only show error on initial load, not during polling
      if (jobs.length === 0) {
        setError(err.message || 'Failed to load jobs')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      // Prepare request data
      const requestData: StartSiteScanRequest = {
        botId,
        startUrlAfterLogin: formData.startUrlAfterLogin,
      }

      // Add login details if required
      if (requiresLogin) {
        requestData.loginUrl = formData.loginUrl
        requestData.usernameSelector = formData.usernameSelector
        requestData.passwordSelector = formData.passwordSelector
        requestData.submitSelector = formData.submitSelector
        requestData.username = formData.username
        requestData.password = formData.password
      }

      await siteScanApi.startSiteScan(requestData, session.access_token)

      setSuccess(
        isHebrew
          ? 'הסריקה החלה בהצלחה! התהליך ירוץ ברקע'
          : 'Scan started successfully! The process will run in the background'
      )

      // Reset form
      setFormData({
        botId,
        startUrlAfterLogin: '',
        loginUrl: '',
        usernameSelector: '#username',
        passwordSelector: '#password',
        submitSelector: 'button[type="submit"]',
        username: '',
        password: '',
      })
      setRequiresLogin(false)

      // Reload jobs
      setTimeout(() => loadJobs(), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start scan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm(isHebrew ? 'האם למחוק משימה זו?' : 'Delete this scan job?')) {
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      await siteScanApi.deleteSiteScanJob(jobId, botId, session.access_token)

      setSuccess(isHebrew ? 'המשימה נמחקה בהצלחה' : 'Job deleted successfully')

      // Reload jobs
      loadJobs()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete job')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      queued: {
        icon: <Clock className="h-3 w-3" />,
        label: isHebrew ? 'בתור' : 'Queued',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      processing: {
        icon: <RefreshCw className="h-3 w-3 animate-spin" />,
        label: isHebrew ? 'מעבד' : 'Processing',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      },
      completed: {
        icon: <CheckCircle className="h-3 w-3" />,
        label: isHebrew ? 'הושלם' : 'Completed',
        color: 'bg-green-100 text-green-700 border-green-200',
      },
      failed: {
        icon: <XCircle className="h-3 w-3" />,
        label: isHebrew ? 'נכשל' : 'Failed',
        color: 'bg-red-100 text-red-700 border-red-200',
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(isHebrew ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Scan Form */}
      <div className="border border-primary/20 rounded-lg p-6 bg-dark-50">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          {isHebrew ? 'התחל סריקת אתר חדשה' : 'Start New Website Scan'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main URL */}
          <Input
            label={isHebrew ? 'כתובת האתר לסריקה' : 'Website URL to Scan'}
            placeholder="https://example.com/content"
            value={formData.startUrlAfterLogin}
            onChange={(e) =>
              setFormData({ ...formData, startUrlAfterLogin: e.target.value })
            }
            required
          />

          {/* Login Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresLogin"
              checked={requiresLogin}
              onChange={(e) => setRequiresLogin(e.target.checked)}
              className="w-4 h-4 rounded border-primary/20 bg-dark-50 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="requiresLogin" className="text-sm text-white flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {isHebrew ? 'האתר דורש התחברות' : 'Site requires login'}
            </label>
          </div>

          {/* Login Details (conditional) */}
          {requiresLogin && (
            <div className="space-y-4 border border-primary/10 rounded-lg p-4 bg-dark-100">
              <p className="text-xs text-[#666666] mb-2">
                {isHebrew
                  ? 'הזן את פרטי ההתחברות והסלקטורים של שדות הטופס'
                  : 'Enter login credentials and form field selectors'}
              </p>

              <Input
                label={isHebrew ? 'כתובת דף התחברות' : 'Login Page URL'}
                placeholder="https://example.com/login"
                value={formData.loginUrl}
                onChange={(e) =>
                  setFormData({ ...formData, loginUrl: e.target.value })
                }
                required={requiresLogin}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={isHebrew ? 'שם משתמש' : 'Username'}
                  placeholder="user@example.com"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required={requiresLogin}
                />

                <Input
                  label={isHebrew ? 'סיסמה' : 'Password'}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={requiresLogin}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-white">
                  {isHebrew ? 'סלקטורי CSS' : 'CSS Selectors'}
                </p>

                <Input
                  label={isHebrew ? 'סלקטור שדה שם משתמש' : 'Username Field Selector'}
                  placeholder="#username"
                  value={formData.usernameSelector}
                  onChange={(e) =>
                    setFormData({ ...formData, usernameSelector: e.target.value })
                  }
                />

                <Input
                  label={isHebrew ? 'סלקטור שדה סיסמה' : 'Password Field Selector'}
                  placeholder="#password"
                  value={formData.passwordSelector}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordSelector: e.target.value })
                  }
                />

                <Input
                  label={isHebrew ? 'סלקטור כפתור התחברות' : 'Submit Button Selector'}
                  placeholder='button[type="submit"]'
                  value={formData.submitSelector}
                  onChange={(e) =>
                    setFormData({ ...formData, submitSelector: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {isHebrew ? 'מתחיל סריקה...' : 'Starting scan...'}
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                {isHebrew ? 'התחל סריקה' : 'Start Scan'}
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            {isHebrew ? 'משימות סריקה' : 'Scan Jobs'}
            {jobs.length > 0 && (
              <span className="ml-2 text-sm text-[#666666]">({jobs.length})</span>
            )}
          </h3>
          <Button variant="ghost" size="sm" onClick={loadJobs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 border border-primary/20 rounded-lg">
            <Globe className="h-12 w-12 text-[#666666] mx-auto mb-4" />
            <p className="text-sm text-[#666666]">
              {isHebrew ? 'אין משימות סריקה' : 'No scan jobs yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border border-primary/20 rounded-lg p-4 bg-dark-50 hover:bg-dark-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-sm font-medium text-white truncate">
                        {job.startUrlAfterLogin}
                      </p>
                    </div>

                    {job.loginUrl && (
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-3 w-3 text-[#666666] flex-shrink-0" />
                        <p className="text-xs text-[#666666] truncate">
                          {isHebrew ? 'עם התחברות' : 'With login'}: {job.loginUrl}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-[#666666]">
                      {formatDate(job.createdAt)}
                    </p>

                    {job.errorMessage && (
                      <div className="mt-2 flex items-start gap-2 p-2 rounded bg-red-50 border border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">{job.errorMessage}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusBadge(job.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      title={isHebrew ? 'מחק משימה' : 'Delete job'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

