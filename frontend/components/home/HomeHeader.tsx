'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export function HomeHeader() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-sm border-b border-dark-100 shadow-glow">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3 animate-fade-in">
          <div className="bg-gradient-cyan p-2.5 rounded-2xl shadow-glow">
            <Bot className="h-6 w-6 text-dark" />
          </div>
          <h1 className="text-2xl font-bold text-primary text-glow">
            AgentDesk
          </h1>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-dark-800 hover:text-primary transition-smooth font-medium">
            {t('nav.features')}
          </a>
          <Link href="/pricing" className="text-dark-800 hover:text-primary transition-smooth font-medium">
            {t('nav.pricing')}
          </Link>
          <Link href="/about" className="text-dark-800 hover:text-primary transition-smooth font-medium">
            {t('nav.about')}
          </Link>
          <Link href="/support" className="text-dark-800 hover:text-primary transition-smooth font-medium">
            {t('nav.support')}
          </Link>
        </nav>
        
        <div className="flex items-center gap-3 animate-fade-in delay-100">
          <LanguageToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-primary hover:bg-dark-50 transition-smooth rounded-full px-6">
              {t('nav.login')}
            </Button>
          </Link>
          <Link href="/register?plan=starter">
            <Button className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-6 py-2.5 text-dark font-medium">
              {t('nav.startTrial')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

