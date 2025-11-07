'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-dark-200',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 transition-all duration-300 ease-in-out',
            indicatorClassName || 'bg-primary'
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }

