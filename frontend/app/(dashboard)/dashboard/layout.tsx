import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { TrialBanner, TrialExpiredModal } from '@/components/subscription/trial-banner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-dark">
      <DashboardNav user={user} />
      <TrialBanner />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <TrialExpiredModal />
    </div>
  )
}

