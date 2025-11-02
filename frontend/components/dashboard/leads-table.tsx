'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Mail, Phone, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Lead {
  id: string
  bot_id: string
  full_name: string
  phone?: string
  email?: string
  question?: string
  status: string
  created_at: string
  bots: { name: string }
}

export function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads] = useState(initialLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.bots.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Question', 'Bot', 'Status', 'Date']
    const rows = filteredLeads.map((lead) => [
      lead.full_name,
      lead.email || '',
      lead.phone || '',
      lead.question || '',
      lead.bots.name,
      lead.status,
      new Date(lead.created_at).toLocaleString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'contacted':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'qualified':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30'
      case 'converted':
        return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'lost':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      default:
        return 'bg-dark-100 text-dark-800 border-dark-100'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-800" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            {/* Export */}
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-dark-800 mx-auto mb-4" />
            <p className="text-dark-800">No leads found</p>
            <p className="text-sm text-dark-800 mt-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Enable lead collection in bot actions to start capturing leads'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Question
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Bot
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-dark-100 hover:bg-dark-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{lead.full_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm text-dark-800">
                            <Mail className="h-3 w-3" />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:text-primary"
                            >
                              {lead.email}
                            </a>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-dark-800">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${lead.phone}`} className="hover:text-primary">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-dark-800 max-w-xs truncate">
                        {lead.question || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-dark-800">{lead.bots.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(lead.status)} capitalize`}
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-dark-800">
                        {formatDate(lead.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

