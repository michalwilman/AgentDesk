'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2, Mail, User, Building, MessageSquare } from 'lucide-react'

interface ContactSalesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
  userName?: string
}

export function ContactSalesModal({ 
  open, 
  onOpenChange,
  userEmail = '',
  userName = ''
}: ContactSalesModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: userName,
    email: userEmail,
    company: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to send a request')
      }

      const response = await fetch('/api/contact-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          company: formData.company,
          message: formData.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request')
      }

      setSuccess(true)
      
      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setSuccess(false)
        setFormData({ fullName: userName, email: userEmail, company: '', message: '' })
        onOpenChange(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error sending contact request:', err)
      setError(err.message || 'Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-dark border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Contact Sales about Premium Plan
          </DialogTitle>
          <DialogDescription className="text-dark-800">
            Our team will review your request and contact you within 24 hours to discuss a custom Premium plan tailored to your needs.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-500/20 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Request Sent Successfully!</h3>
              <p className="text-dark-800">
                Your request has been received. Our team will contact you soon.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
                disabled={loading}
                className="bg-dark-50 border-dark-100 text-white placeholder:text-dark-800 focus:border-primary"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={loading}
                className="bg-dark-50 border-dark-100 text-white placeholder:text-dark-800 focus:border-primary"
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Company / Business Name (Optional)
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Your Company Ltd."
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                disabled={loading}
                className="bg-dark-50 border-dark-100 text-white placeholder:text-dark-800 focus:border-primary"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Message *
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us about your needs, expected volume, and any specific requirements..."
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required
                disabled={loading}
                rows={5}
                className="bg-dark-50 border-dark-100 text-white placeholder:text-dark-800 focus:border-primary resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-cyan hover:shadow-glow-lg transition-smooth"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

