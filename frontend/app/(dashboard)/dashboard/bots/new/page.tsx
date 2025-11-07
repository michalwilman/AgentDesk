'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreateBotForm } from '@/components/dashboard/create-bot-form'

export default function NewBotPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <CreateBotForm />
    </div>
  )
}

