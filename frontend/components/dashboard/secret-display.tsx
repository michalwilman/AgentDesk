'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from './copy-button'

interface SecretDisplayProps {
  value: string
  type?: 'code' | 'token'
  className?: string
}

export function SecretDisplay({ value, type = 'token', className = '' }: SecretDisplayProps) {
  const [isVisible, setIsVisible] = useState(false)

  const maskedValue = type === 'token' 
    ? '•'.repeat(40)
    : '•'.repeat(80)

  if (type === 'code') {
    return (
      <div className="relative">
        <pre className={`bg-dark text-primary p-4 rounded-lg overflow-x-auto text-sm border border-primary/20 ${className}`}>
          {isVisible ? value : maskedValue}
        </pre>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="bg-dark-50"
          >
            {isVisible ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
          <CopyButton 
            text={value}
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <code className={`flex-1 bg-dark-50 px-3 py-2 rounded text-sm font-mono text-primary border border-primary/20 ${className}`}>
        {isVisible ? value : maskedValue}
      </code>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <CopyButton 
        text={value}
        variant="outline"
        size="sm"
      />
    </div>
  )
}

