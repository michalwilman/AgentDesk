'use client'

import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

interface CopyButtonProps {
  text: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CopyButton({ text, variant = 'outline', size = 'sm', className }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
    >
      <Copy className="h-4 w-4 mr-2" />
      Copy
    </Button>
  )
}

