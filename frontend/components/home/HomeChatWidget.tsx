'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, RotateCw, Trash2, Bot } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const STORAGE_KEY = 'agentdesk_home_chat_history_en'
const PRIMARY_COLOR = '#00E0C6'

const WELCOME_MESSAGE = 'Hi 👋 I\'m the official AgentDesk chatbot.\nWould you like me to explain how to start a trial or how to build your first bot?'

const QUICK_REPLIES = [
  'How do I start a free trial?',
  'How do I build my first bot?',
  'What are the pricing plans?',
  'WordPress/Elementor integration',
  'Support & contact',
]

// Function to parse markdown-style links and convert them to clickable links
function parseMessageWithLinks(text: string) {
  // Regular expression to match [text](url) format
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: Array<{ type: 'text' | 'link'; content: string; url?: string }> = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      })
    }

    // Add the link
    parts.push({
      type: 'link',
      content: match[1], // Link text
      url: match[2], // URL
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    })
  }

  // If no links were found, return the original text as a single part
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: text,
    })
  }

  return parts
}

// Component to render message content with clickable links
function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const parts = parseMessageWithLinks(content)

  return (
    <p className="text-[17px] leading-[1.7]" style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          return (
            <Link
              key={index}
              href={part.url!}
              className={`font-semibold underline hover:no-underline transition-colors ${
                isUser ? 'text-white' : 'text-primary'
              }`}
              onClick={(e) => {
                // Log click event
                console.info('[HOMEBOT] link_clicked', { url: part.url })
                window.dispatchEvent(
                  new CustomEvent('homebot_link_clicked', { detail: { url: part.url } })
                )
              }}
            >
              {part.content}
            </Link>
          )
        }
        return <span key={index}>{part.content}</span>
      })}
    </p>
  )
}

export default function HomeChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastRequestTime = useRef<number>(0)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMessages(parsed)
        // Hide quick replies if there are messages beyond welcome
        if (parsed.length > 1) {
          setShowQuickReplies(false)
        }
      } else {
        // Initialize with welcome message
        setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }])
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }])
    }
  }, [])

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (err) {
        console.error('Failed to save chat history:', err)
      }
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Telemetry helper
  const logEvent = (eventName: string, data?: any) => {
    console.info(`[HOMEBOT] ${eventName}`, data || '')
    // Dispatch custom event for future analytics integration
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }))
  }

  const handleOpen = () => {
    setIsOpen(true)
    logEvent('homebot_opened')
  }

  const handleClose = () => {
    setIsOpen(false)
    logEvent('homebot_closed')
  }

  const handleClearChat = () => {
    const welcomeMsg = [{ role: 'assistant' as const, content: WELCOME_MESSAGE }]
    setMessages(welcomeMsg)
    setShowQuickReplies(true)
    setError(null)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(welcomeMsg))
    logEvent('homebot_chat_cleared')
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return

    // Rate limiting check (client-side)
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime.current
    if (timeSinceLastRequest < 1500) {
      setError('You\'re sending messages too fast, please wait a moment 😊')
      setTimeout(() => setError(null), 2000)
      return
    }

    const userMessage: Message = { role: 'user', content: messageText.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)
    setShowQuickReplies(false)
    lastRequestTime.current = now

    logEvent('homebot_message_sent', { message: messageText })

    try {
      const response = await fetch('/api/homebot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.role !== 'system'), userMessage],
          locale: 'en',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
      }

      setMessages((prev) => [...prev, assistantMessage])
      logEvent('homebot_message_received', { tokensUsed: data.tokensUsed })
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setError(err.message || 'A temporary error occurred. Would you like to try again?')
      logEvent('homebot_error', { error: err.message })
      
      // Remove the user message that failed
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    sendMessage(input)
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRetry = () => {
    setError(null)
    // Get the last user message and resend it
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }

  // Handle Escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpen}
          className="relative bg-gradient-cyan text-dark rounded-full p-6 shadow-glow-lg hover:shadow-glow hover:scale-110 transition-smooth group"
          aria-label="Open chat"
        >
          <MessageSquare className="h-8 w-8" />
          <span className="absolute -top-1 -right-1 bg-primary h-5 w-5 rounded-full border-2 border-dark animate-pulse"></span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50 animate-fade-in">
        <div
          className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: '480px', height: '680px' }}
          role="dialog"
          aria-label="Chat with AgentDesk"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5 text-white"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">AgentDesk</h2>
                <p className="text-base opacity-90">Online</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mb-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <Bot className="w-6 h-6" />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-3xl px-6 py-4 max-w-[340px] ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                  style={
                    message.role === 'user'
                      ? { backgroundColor: PRIMARY_COLOR }
                      : {}
                  }
                >
                  <MessageContent content={message.content} isUser={message.role === 'user'} />
                </div>
              </div>
            ))}

            {/* Quick Replies */}
            {showQuickReplies && messages.length === 1 && !loading && (
              <div className="flex flex-col gap-3 pt-2">
                {QUICK_REPLIES.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-base px-5 py-3.5 rounded-full border-2 text-gray-700 hover:text-white hover:border-transparent transition-all text-left font-medium"
                    style={{
                      borderColor: PRIMARY_COLOR,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = PRIMARY_COLOR
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 mb-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-3xl px-5 py-3">
                  <div className="flex space-x-1.5">
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: PRIMARY_COLOR, animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: PRIMARY_COLOR, animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: PRIMARY_COLOR, animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 mb-2">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Try again</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-5 bg-white">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-opacity-50 text-[17px] text-gray-900 placeholder:text-gray-400 resize-none overflow-y-auto"
                style={{
                  boxShadow: input ? `0 0 0 2px ${PRIMARY_COLOR}20` : undefined,
                  minHeight: '56px',
                  maxHeight: '120px'
                }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-14 h-14 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105 flex-shrink-0 shadow-md mb-0.5"
                style={{ backgroundColor: PRIMARY_COLOR }}
                aria-label="Send message"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
      </div>
    </div>

      {/* Mobile View - Full Width Sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div
          className="flex flex-col bg-white rounded-t-3xl shadow-2xl overflow-hidden"
          style={{ height: '85vh' }}
          role="dialog"
          aria-label="Chat with AgentDesk"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-5 text-white"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">AgentDesk</h2>
                <p className="text-base opacity-90">Online</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mb-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <Bot className="w-6 h-6" />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-3xl px-5 py-4 max-w-[80%] ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                  style={
                    message.role === 'user'
                      ? { backgroundColor: PRIMARY_COLOR }
                      : {}
                  }
                >
                  <MessageContent content={message.content} isUser={message.role === 'user'} />
                </div>
              </div>
            ))}

            {/* Quick Replies */}
            {showQuickReplies && messages.length === 1 && !loading && (
              <div className="flex flex-col gap-3 pt-2">
                {QUICK_REPLIES.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-base px-5 py-3.5 rounded-full border-2 text-gray-700 hover:text-white hover:border-transparent transition-all text-left font-medium"
                    style={{
                      borderColor: PRIMARY_COLOR,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = PRIMARY_COLOR
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 mb-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    <Bot className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-3xl px-5 py-4">
                  <div className="flex space-x-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full animate-bounce"
                      style={{ backgroundColor: PRIMARY_COLOR, animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full animate-bounce"
                      style={{ backgroundColor: PRIMARY_COLOR, animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full animate-bounce"
                      style={{ backgroundColor: PRIMARY_COLOR, animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 mb-2">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Try again</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-5 bg-white safe-area-bottom">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-opacity-50 text-[17px] text-gray-900 placeholder:text-gray-400 resize-none overflow-y-auto"
                style={{
                  boxShadow: input ? `0 0 0 2px ${PRIMARY_COLOR}20` : undefined,
                  minHeight: '56px',
                  maxHeight: '120px'
                }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-14 h-14 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-105 flex-shrink-0 shadow-md mb-0.5"
                style={{ backgroundColor: PRIMARY_COLOR }}
                aria-label="Send message"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

