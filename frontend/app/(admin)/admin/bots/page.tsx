'use client'

import { useState, useEffect } from 'react'
import { DataTable, Column } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, RefreshCw, Bot, MessageSquare } from 'lucide-react'
import { getAllBots } from '@/lib/admin/admin-api'
import Link from 'next/link'

interface BotData {
  id: string
  name: string
  is_active: boolean
  created_at: string
  user_id: string
  chat_count: number
  user: {
    email: string
    full_name: string | null
  }
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotData[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const pageSize = 50

  useEffect(() => {
    fetchBots()
  }, [currentPage, searchTerm])

  async function fetchBots() {
    setLoading(true)
    try {
      const response = await getAllBots({
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        search: searchTerm || undefined,
      })

      let filteredBots = response.bots

      // Apply filters
      if (filter === 'active') {
        filteredBots = filteredBots.filter(b => b.is_active)
      } else if (filter === 'inactive') {
        filteredBots = filteredBots.filter(b => !b.is_active)
      }

      setBots(filteredBots)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch bots:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<BotData>[] = [
    {
      key: 'name',
      label: 'Bot Name',
      render: (bot) => (
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{bot.name}</span>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (bot) => (
        <div>
          <div className="font-medium">{bot.user?.full_name || 'N/A'}</div>
          <Link
            href={`/admin/users/${bot.user_id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {bot.user?.email}
          </Link>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (bot) => (
        <StatusBadge status={bot.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'chat_count',
      label: 'Chats',
      render: (bot) => (
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{bot.chat_count}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (bot) => (
        <div className="text-sm">
          {new Date(bot.created_at).toLocaleDateString()}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bot Management</h1>
        <p className="text-gray-500 mt-2">View and monitor all bots in the system</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Bots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Bots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {bots.filter(b => b.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inactive Bots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">
              {bots.filter(b => !b.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by bot name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fetchBots()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('all')
                setCurrentPage(1)
                fetchBots()
              }}
            >
              All Bots
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('active')
                setCurrentPage(1)
                fetchBots()
              }}
            >
              Active
            </Button>
            <Button
              variant={filter === 'inactive' ? 'default' : 'outline'}
              onClick={() => {
                setFilter('inactive')
                setCurrentPage(1)
                fetchBots()
              }}
            >
              Inactive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bots Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={bots}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            loading={loading}
            emptyMessage="No bots found"
            getRowKey={(bot) => bot.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}

