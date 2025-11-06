import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AppointmentsTable } from '@/components/dashboard/appointments-table'

export default async function AppointmentsPage({ 
  searchParams 
}: { 
  searchParams: { bot_id?: string } 
}) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get bot_id from query params if provided
  const filterBotId = searchParams?.bot_id

  // Get all user's bots
  const { data: bots } = await supabase
    .from('bots')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const botIds = bots?.map((b) => b.id) || []

  // Get all appointments for user's bots (or filtered by bot_id if provided)
  let appointments: any[] = []
  if (botIds.length > 0) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        bots!inner(name)
      `)
      .in('bot_id', botIds)
    
    // Filter by specific bot if bot_id is provided
    if (filterBotId) {
      query = query.eq('bot_id', filterBotId)
    }
    
    const { data: appointmentsData } = await query.order('scheduled_time', { ascending: true })

    appointments = appointmentsData || []
  }

  // Calculate stats
  const now = new Date()
  const totalAppointments = appointments.length
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.scheduled_time) >= now && a.status !== 'cancelled'
  ).length
  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length

  return (
    <div className="space-y-6">
      <Link href={filterBotId ? `/dashboard/bots/${filterBotId}` : '/dashboard'}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {filterBotId ? 'Back to Bot' : 'Back to Dashboard'}
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Appointments</h1>
        <p className="text-dark-800 mt-2">
          All appointments scheduled by your bots
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">Total</div>
          <div className="text-3xl font-bold text-white mt-2">{totalAppointments}</div>
        </div>
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">Upcoming</div>
          <div className="text-3xl font-bold text-primary mt-2">{upcomingAppointments}</div>
        </div>
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">Pending</div>
          <div className="text-3xl font-bold text-yellow-500 mt-2">{pendingAppointments}</div>
        </div>
        <div className="bg-dark-50 rounded-lg p-6 border border-dark-100">
          <div className="text-sm text-dark-800">Completed</div>
          <div className="text-3xl font-bold text-green-500 mt-2">{completedAppointments}</div>
        </div>
      </div>

      {/* Appointments Table */}
      <AppointmentsTable appointments={appointments} />
    </div>
  )
}

