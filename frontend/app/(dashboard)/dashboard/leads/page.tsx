import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LeadsTable } from '@/components/dashboard/leads-table'

export default async function LeadsPage() {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all user's bots
  const { data: bots } = await supabase
    .from('bots')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const botIds = bots?.map((b) => b.id) || []

  // Get all leads for user's bots
  let leads: any[] = []
  if (botIds.length > 0) {
    const { data: leadsData } = await supabase
      .from('leads')
      .select(`
        *,
        bots!inner(name)
      `)
      .in('bot_id', botIds)
      .order('created_at', { ascending: false })

    leads = leadsData || []
  }

  // Calculate stats
  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.status === 'new').length
  const convertedLeads = leads.filter((l) => l.status === 'converted').length
  const last7DaysLeads = leads.filter(
    (l) => new Date(l.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length

  return (
    <div className="space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Leads</h1>
        <p className="text-dark-800 mt-2">
          All leads captured by your bots
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">Total Leads</div>
          <div className="text-3xl font-bold text-white mt-2">{totalLeads}</div>
        </div>
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">New</div>
          <div className="text-3xl font-bold text-primary mt-2">{newLeads}</div>
        </div>
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">Converted</div>
          <div className="text-3xl font-bold text-green-500 mt-2">{convertedLeads}</div>
        </div>
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">Last 7 Days</div>
          <div className="text-3xl font-bold text-white mt-2">{last7DaysLeads}</div>
        </div>
      </div>

      {/* Leads Table */}
      <LeadsTable leads={leads} />
    </div>
  )
}

