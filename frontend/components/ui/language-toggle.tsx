'use client'

import { useLanguage } from '@/lib/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 p-1 bg-dark-100/50 rounded-lg border border-primary/20">
      <button
        onClick={() => setLanguage('en')}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
          ${language === 'en' 
            ? 'bg-primary text-dark shadow-glow' 
            : 'text-dark-800 hover:text-primary hover:bg-dark-100'
          }
        `}
        aria-label="Switch to English"
      >
        EN
      </button>
      <div className="w-px h-4 bg-primary/20" />
      <button
        onClick={() => setLanguage('he')}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
          ${language === 'he' 
            ? 'bg-primary text-dark shadow-glow' 
            : 'text-dark-800 hover:text-primary hover:bg-dark-100'
          }
        `}
        aria-label="Switch to Hebrew"
      >
        עב
      </button>
    </div>
  )
}

export function LanguageToggleWithIcon() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-primary" />
      <div className="flex items-center gap-1 p-1 bg-dark-100/50 rounded-lg border border-primary/20">
        <button
          onClick={() => setLanguage('en')}
          className={`
            px-2.5 py-1 rounded text-xs font-medium transition-all duration-200
            ${language === 'en' 
              ? 'bg-primary text-dark shadow-glow' 
              : 'text-dark-800 hover:text-primary hover:bg-dark-100'
            }
          `}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('he')}
          className={`
            px-2.5 py-1 rounded text-xs font-medium transition-all duration-200
            ${language === 'he' 
              ? 'bg-primary text-dark shadow-glow' 
              : 'text-dark-800 hover:text-primary hover:bg-dark-100'
            }
          `}
        >
          עב
        </button>
      </div>
    </div>
  )
}

