import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting storage (in-memory, simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or a combination of headers for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const limit = rateLimitMap.get(key)

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(key, { count: 1, resetTime: now + 2000 }) // 2 seconds window
    return { allowed: true }
  }

  if (limit.count >= 1) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((limit.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // Increment count
  limit.count++
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request)
    const rateLimitCheck = checkRateLimit(rateLimitKey)

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'You\'re sending messages too fast. Please wait a moment 😊', retryAfter: rateLimitCheck.retryAfter },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { messages, locale = 'en' } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // System prompt for marketing bot
    const systemPrompt = `You are the official AgentDesk chatbot. Your goal is to help website visitors understand what AgentDesk does, how to start a free 7-day trial, how to build their first bot, and the benefits for businesses.

VERY IMPORTANT: In every response, always include a clear Call-to-Action with an active link!

How to write links: Use the format [link text](URL) - for example: [Click here to start your free trial](/register?plan=starter)

Keep responses short, clear, in English, with a friendly and professional tone and a clear CALL-TO-ACTION.

When someone asks about the trial period:
- Explain it's free for 7 days, no credit card required
- Add an active link: [Start your free trial now](/register?plan=starter)
- Example: "To start your free 7-day trial, [click here to sign up](/register?plan=starter) 🎉"

When someone asks how to build a bot:
- Explain the process is simple: sign up, name your bot, upload content or add website links, and the bot learns automatically
- Add link: [Start building your bot](/register?plan=starter)
- Example: "Building your bot is easy! [Get started now](/register?plan=starter) 🚀"

When someone asks about pricing:
- Explain there are multiple plans for different needs
- Add link: [View all plans and pricing](/pricing)
- Mention free trial with link: [Start free trial](/register?plan=starter)

When someone asks about integration:
- Explain there's support for WordPress, Elementor, Shopify and other websites
- Add: [Start free trial](/register?plan=starter) to get your embed code

When someone needs support:
- Direct to support page: [Contact our support team](/support)
- Add that they can also [start a free trial](/register?plan=starter) and see for themselves

When someone asks general questions about AgentDesk:
- Always end with: [Want to try? Start your free trial](/register?plan=starter)

Don't answer questions unrelated to AgentDesk. If asked something irrelevant, redirect back to topics related to the service.

Remember: Every response must end with an active link for a call-to-action!`

    // Build OpenAI messages array
    const openaiMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter((msg: any) => msg.role === 'user' || msg.role === 'assistant'),
    ]

    // Call OpenAI API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 18000) // 18 second timeout

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 400,
      }, {
        signal: controller.signal as any,
      })

      clearTimeout(timeoutId)

      const reply = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.'

      return NextResponse.json({
        reply,
        tokensUsed: completion.usage?.total_tokens || 0,
      })
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Response time too long - please try again' },
          { status: 504 }
        )
      }
      throw error
    }
  } catch (error: any) {
    console.error('Homebot API error:', error)
    
    // Log telemetry event
    console.info('[HOMEBOT] Error:', error.message)

    return NextResponse.json(
      { error: 'A temporary error occurred. Would you like to try again?' },
      { status: 500 }
    )
  }
}

