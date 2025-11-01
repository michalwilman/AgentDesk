'use client'

import { useState } from 'react'
import { Globe, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface KnowledgeWebsiteCrawlingProps {
  botId: string
}

export function KnowledgeWebsiteCrawling({ botId }: KnowledgeWebsiteCrawlingProps) {
  const [url, setUrl] = useState('')
  const [crawling, setCrawling] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCrawl = async () => {
    if (!url) {
      setMessage({ type: 'error', text: 'Please enter a website URL' })
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      setMessage({ type: 'error', text: 'Please enter a valid URL (e.g., https://example.com)' })
      return
    }

    setCrawling(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('supabase.auth.token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scraper/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          url,
          maxPages: 10,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to start crawling')
      }

      const data = await response.json()
      setMessage({ 
        type: 'success', 
        text: `Crawling started! Processing ${data.pagesQueued || 'multiple'} pages. This may take a few minutes.` 
      })
      setUrl('')
      
      // Refresh after 3 seconds
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to start crawling' })
    } finally {
      setCrawling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="https://yourwebsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={crawling}
            className="bg-dark-50 border-dark-100 text-white placeholder:text-dark-800"
          />
        </div>
        <Button
          onClick={handleCrawl}
          disabled={crawling || !url}
          className="gap-2"
        >
          {crawling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Crawling...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Start Crawling
            </>
          )}
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`
          flex items-start gap-3 p-4 rounded-lg border
          ${message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
          }
        `}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-dark-50 border border-dark-100 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          How Website Crawling Works
        </h4>
        <ul className="space-y-2 text-sm text-dark-800">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Enter your website URL and we'll automatically discover and extract content from up to 10 pages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>The bot will learn from your website's content to provide accurate answers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Crawling may take a few minutes depending on your website size</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>You can re-crawl anytime to update the bot with fresh content</span>
          </li>
        </ul>
      </div>

      {/* Coming Soon: Crawled Pages List */}
      <div className="border-t border-dark-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">Crawled Pages</h4>
          <span className="text-sm text-dark-800">Coming soon</span>
        </div>
        <p className="text-sm text-dark-800">
          View and manage all pages that have been crawled from your website
        </p>
      </div>
    </div>
  )
}

