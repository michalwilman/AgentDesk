import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-cyan text-dark hover:shadow-glow-lg': variant === 'primary',
            'bg-dark-50 text-white hover:bg-dark-100 border border-primary/20': variant === 'secondary',
            'border-2 border-primary bg-transparent text-primary hover:bg-primary/10': variant === 'outline',
            'hover:bg-dark-50 text-white': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 hover:shadow-glow': variant === 'danger',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }

