import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, AlertCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'trial' | 'paid' | 'expired' | 'suspended'
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    active: {
      label: 'Active',
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
      icon: Check,
    },
    inactive: {
      label: 'Inactive',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      icon: X,
    },
    trial: {
      label: 'Trial',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      icon: Clock,
    },
    paid: {
      label: 'Paid',
      className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
      icon: Check,
    },
    expired: {
      label: 'Expired',
      className: 'bg-red-100 text-red-800 hover:bg-red-200',
      icon: AlertCircle,
    },
    suspended: {
      label: 'Suspended',
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      icon: X,
    },
  }

  const { label, className, icon: Icon } = config[status]
  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'

  return (
    <Badge className={className}>
      <Icon className={`${iconSize} mr-1`} />
      {label}
    </Badge>
  )
}

