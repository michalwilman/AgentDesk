'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { MessageSquare, X, Send, MoreVertical, Trash2, Download, Clock, Copy, Check, Minus, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface BotConfig {
  name: string
  avatar_url: string | null
  primary_color: string
  welcome_message: string
  welcome_messages?: string[]
  language: string
  position: string
}

export function ChatWidget({ botToken }: { botToken: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(7)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastWelcomeKey = useRef<string>('')

  // Notify parent window when widget opens/closes (for iframe integration)
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: isOpen ? 'agentdesk-widget-open' : 'agentdesk-widget-close' },
        '*'
      )
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // Fetch bot configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentdesk-backend-production.up.railway.app/api';
        const response = await axios.get(
          `${apiUrl}/bots/config/${botToken}`
        )
        setBotConfig(response.data)
      } catch (error) {
        console.error('Failed to fetch bot config:', error)
        // Set default config if fetch fails
        setBotConfig({
          name: 'Chat Support',
          avatar_url: null,
          primary_color: '#ff0099',
          welcome_message: 'Hello! How can I help you today?',
          language: 'en',
          position: 'bottom-right',
        })
      } finally {
        setConfigLoading(false)
      }
    }
    fetchConfig()
  }, [botToken])

  useEffect(() => {
    if (isOpen && messages.length === 0 && botConfig) {
      // Add welcome messages with typing effect
      const messagesToShow = botConfig.welcome_messages && botConfig.welcome_messages.length > 0 
        ? botConfig.welcome_messages 
        : botConfig.welcome_message
        ? [botConfig.welcome_message]
        : []

      // Don't proceed if no messages to show
      if (messagesToShow.length === 0) return

      // Create a key from messages to detect changes
      const welcomeKey = JSON.stringify(messagesToShow)
      
      // Only run if messages changed (skip check if this is the first time - empty key)
      if (lastWelcomeKey.current !== '' && lastWelcomeKey.current === welcomeKey) return
      
      lastWelcomeKey.current = welcomeKey

      let timeouts: NodeJS.Timeout[] = []
      let cumulativeDelay = 0
      let isCancelled = false

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

      // Cleanup function - only cancel if messages actually changed
      return () => {
        const currentKey = botConfig.welcome_messages && botConfig.welcome_messages.length > 0 
          ? JSON.stringify(botConfig.welcome_messages)
          : botConfig.welcome_message
          ? JSON.stringify([botConfig.welcome_message])
          : ''
        
        // Only cancel timeouts if messages actually changed
        if (currentKey !== welcomeKey) {
          isCancelled = true
          timeouts.forEach(timeout => clearTimeout(timeout))
        }
      }
    }
  }, [isOpen, botConfig, messages.length])

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentdesk-backend-production.up.railway.app/api';
      const response = await axios.post(
        `${apiUrl}/chat/message`,
        {
          sessionId,
          message: userMessage,
          visitorMetadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        },
        {
          headers: {
            'X-Bot-Token': botToken,
          },
        }
      )

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.message },
      ])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    if (botConfig) {
      const messagesToShow = botConfig.welcome_messages && botConfig.welcome_messages.length > 0 
        ? botConfig.welcome_messages 
        : [botConfig.welcome_message]

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
    }
    setShowMenu(false)
  }

  const downloadChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role === 'user' ? (botConfig?.language === 'he' ? 'אני' : 'User') : botConfig?.name}: ${msg.content}`)
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

  if (configLoading || !botConfig) {
    return null
  }

  const isRtl = botConfig.language === 'he'
  const primaryColor = botConfig.primary_color

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center w-16 h-16 text-white rounded-full shadow-xl hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: primaryColor }}
            aria-label="Open chat"
          >
            {botConfig.avatar_url ? (
              <img 
                src={botConfig.avatar_url} 
                alt={botConfig.name}
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
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
          style={{ width: '380px', height: '580px' }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-5 py-4 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                {botConfig.avatar_url ? (
                  <img 
                    src={botConfig.avatar_url} 
                    alt={botConfig.name}
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
                <h3 className="font-semibold text-base">{botConfig.name}</h3>
                <p className="text-xs opacity-90">
                  {isRtl ? 'מקוון' : 'Online'}
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
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
                aria-label={isRtl ? 'מזעור' : 'Minimize'}
                title={isRtl ? 'מזעור' : 'Minimize'}
              >
                <Minus className="w-5 h-5" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
                aria-label={isRtl ? 'סגור' : 'Close'}
                title={isRtl ? 'סגור' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  message.role === 'user' 
                    ? 'justify-end' 
                    : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mb-1 relative">
                    {botConfig.avatar_url ? (
                      <img 
                        src={botConfig.avatar_url} 
                        alt={botConfig.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {botConfig.name.charAt(0)}
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  </div>
                )}

                {/* Message Bubble */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-3xl px-4 py-3 ${
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

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 mb-1 relative">
                  {botConfig.avatar_url ? (
                    <img 
                      src={botConfig.avatar_url} 
                      alt={botConfig.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {botConfig.name.charAt(0)}
                    </div>
                  )}
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-3xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: primaryColor, animationDelay: '0ms' }}
                    />
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: primaryColor, animationDelay: '150ms' }}
                    />
                    <div 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: primaryColor, animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isRtl ? 'הקלד הודעה...' : 'Type your message...'}
                rows={1}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm resize-none overflow-y-auto"
                style={{ 
                  boxShadow: input ? `0 0 0 2px ${primaryColor}20` : undefined,
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
                disabled={loading}
                dir={isRtl ? 'rtl' : 'ltr'}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-12 h-12 text-white rounded-full transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex-shrink-0 mb-0.5"
                style={{ backgroundColor: primaryColor }}
                aria-label={isRtl ? 'שלח הודעה' : 'Send message'}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

