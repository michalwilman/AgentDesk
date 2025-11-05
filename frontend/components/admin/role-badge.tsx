import { Badge } from '@/components/ui/badge'
import { Shield, UserCog, User } from 'lucide-react'

interface RoleBadgeProps {
  role: 'user' | 'admin' | 'super_admin'
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = {
    user: {
      label: 'User',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      icon: User,
    },
    admin: {
      label: 'Admin',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      icon: UserCog,
    },
    super_admin: {
      label: 'Super Admin',
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      icon: Shield,
    },
  }

  const { label, className, icon: Icon } = config[role]

  return (
    <Badge className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}

