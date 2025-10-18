'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, MoreVertical, Trash2, Download, Clock, Copy, Check, Minus, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface BotChatPreviewProps {
  botId: string
  botName: string
  botToken: string
  primaryColor: string
  welcomeMessage: string
  welcomeMessages?: string[]
  language: string
  avatarUrl?: string | null
}

export function BotChatPreview({
  botId,
  botName,
  botToken,
  primaryColor,
  welcomeMessage,
  welcomeMessages,
  language,
  avatarUrl,
}: BotChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const lastWelcomeKey = useRef<string>('')
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Determine which messages to show
    const messagesToShow = welcomeMessages && welcomeMessages.length > 0 
      ? welcomeMessages 
      : welcomeMessage 
      ? [welcomeMessage]
      : []

    // Don't proceed if no messages to show
    if (messagesToShow.length === 0) return

    // Create a key from messages to detect changes
    const welcomeKey = JSON.stringify(messagesToShow)
    
    // Only run if messages changed (skip check if this is the first time - empty key)
    if (lastWelcomeKey.current !== '' && lastWelcomeKey.current === welcomeKey) {
      return
    }
    
    lastWelcomeKey.current = welcomeKey

    let timeouts: NodeJS.Timeout[] = []
    let cumulativeDelay = 0
    let isCancelled = false
    
    // Clear and set initial messages
    setMessages([])

    messagesToShow.forEach((message, index) => {
      const timeout = setTimeout(() => {
        if (!isCancelled) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: message,
            },
          ])
        }
      }, cumulativeDelay)
      
      timeouts.push(timeout)
      
      // Calculate delay for next message based on current message length (0.04 seconds per character)
      cumulativeDelay += message.length * 40
    })

    // Cleanup function - only cancel if key changed (new messages incoming)
    return () => {
      const currentKey = JSON.stringify(
        welcomeMessages && welcomeMessages.length > 0 
          ? welcomeMessages 
          : welcomeMessage 
          ? [welcomeMessage]
          : []
      )
      
      // Only cancel timeouts if messages actually changed
      if (currentKey !== welcomeKey) {
        isCancelled = true
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }
  }, [welcomeMessage, welcomeMessages])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
          botId: botId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ])
    } catch (error: any) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: language === 'he' 
            ? 'מצטער, נתקלתי בשגיאה. אנא נסה שוב.'
            : 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const clearChat = () => {
    const messagesToShow = welcomeMessages && welcomeMessages.length > 0 
      ? welcomeMessages 
      : [welcomeMessage]

    lastWelcomeKey.current = '' // Reset key to force re-show
    setMessages([])
    
    // Re-show welcome messages with typing effect
    let cumulativeDelay = 0
    
    messagesToShow.forEach((message, index) => {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant' as const,
            content: message,
          },
        ])
      }, cumulativeDelay)
      
      cumulativeDelay += message.length * 40
    })
    
    // Update the key after setting up timeouts
    lastWelcomeKey.current = JSON.stringify(messagesToShow)
    
    setShowMenu(false)
  }

  const downloadChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role === 'user' ? (language === 'he' ? 'אני' : 'User') : botName}: ${msg.content}`)
      .join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${sessionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowMenu(false)
  }

  const isRtl = language === 'he'

  return (
    <>
      {/* Minimized - Show Floating Button */}
      {isMinimized && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center justify-center w-16 h-16 text-white rounded-full shadow-xl hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: primaryColor }}
              aria-label={isRtl ? 'פתח צ\'אט' : 'Open chat'}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={botName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Bot className="w-8 h-8" />
              )}
            </button>
            {/* Online Status Indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
            </div>
          </div>
        </div>
      )}

      {/* Expanded - Show Full Chat */}
      {!isMinimized && (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: '400px', height: '600px' }}
      >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={botName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
            )}
            {/* Online Status Indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{botName}</h2>
            <p className="text-sm opacity-90">
              {language === 'he' ? 'מקוון' : 'Online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
              aria-label="Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                <button
                  onClick={clearChat}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isRtl ? 'נקה שיחה' : 'Clear chat'}</span>
                </button>
                <button
                  onClick={downloadChat}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{isRtl ? 'הורד שיחה' : 'Download chat'}</span>
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left text-sm"
                >
                  <Clock className="w-4 h-4" />
                  <span>{isRtl ? 'שיחות אחרונות' : 'Recent chats'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
            aria-label={isRtl ? 'מזעור' : 'Minimize'}
            title={isRtl ? 'מזעור' : 'Minimize'}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Bot Avatar */}
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 mb-1 relative">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={botName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {botName.charAt(0)}
                  </div>
                )}
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
              </div>
            )}

            {/* Message Bubble */}
            <div className="flex flex-col gap-1">
              <div
                className={`rounded-3xl px-4 py-3 max-w-[290px] ${
                  message.role === 'user'
                    ? 'text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
                style={
                  message.role === 'user'
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
              
              {/* Copy Button for Bot Messages */}
              {message.role === 'assistant' && (
                <button
                  onClick={() => copyMessage(message.content, index)}
                  className="self-start flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title={isRtl ? 'העתק' : 'Copy'}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>{isRtl ? 'הועתק!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{isRtl ? 'העתק' : 'Copy'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="flex-shrink-0 mb-1 relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={botName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {botName.charAt(0)}
                </div>
              )}
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div className="bg-white text-gray-800 border border-gray-200 rounded-3xl px-4 py-3 max-w-[290px]">
              <div className="flex space-x-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full animate-bounce"
                  style={{ backgroundColor: primaryColor, animationDelay: '0ms' }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full animate-bounce"
                  style={{ backgroundColor: primaryColor, animationDelay: '150ms' }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full animate-bounce"
                  style={{ backgroundColor: primaryColor, animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              language === 'he' ? 'הקלד הודעה...' : 'Type your message...'
            }
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm text-gray-900 placeholder:text-gray-400"
            style={{ 
              boxShadow: input ? `0 0 0 2px ${primaryColor}20` : undefined 
            }}
            disabled={loading}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="flex items-center justify-center w-10 h-10 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105 flex-shrink-0 shadow-md"
            style={{ backgroundColor: primaryColor }}
            aria-label={language === 'he' ? 'שלח הודעה' : 'Send message'}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
      )}
    </>
  )
}

