'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Bot, LogOut, User } from 'lucide-react'
import { SubscriptionBadge } from '@/components/subscription/subscription-badge'
import { NotificationsPanel } from './notifications-panel'
import { LanguageToggleWithIcon } from '@/components/ui/language-toggle'

export function DashboardNav({ user }: { user: any }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-primary/20 bg-dark-50 shadow-glow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-gradient-cyan p-1.5 rounded-lg shadow-glow">
              <Bot className="h-6 w-6 text-dark" />
            </div>
            <span className="text-2xl font-bold text-primary text-glow">AgentDesk</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-dark-800">
              <User className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">{user.email}</span>
            </div>
            <SubscriptionBadge variant="compact" />
            <NotificationsPanel />
            <LanguageToggleWithIcon />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

