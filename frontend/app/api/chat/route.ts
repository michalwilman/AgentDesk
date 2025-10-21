import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, botId } = await request.json()

    if (!message || !botId) {
      return NextResponse.json(
        { error: 'Message and botId are required' },
        { status: 400 }
      )
    }

    // Get bot details from Supabase
    const supabase = createClient()
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single()

    if (botError || !bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      )
    }

    // Get or create chat session
    let chatId: string | null = null
    
    if (sessionId) {
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('session_id', sessionId)
        .eq('bot_id', botId)
        .single()

      if (existingChat) {
        chatId = existingChat.id
      }
    }

    // Create new chat session if needed
    if (!chatId) {
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([
          {
            bot_id: botId,
            session_id: sessionId || `session_${Date.now()}`,
            visitor_metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        ])
        .select()
        .single()

      if (chatError || !newChat) {
        console.error('Error creating chat:', chatError)
      } else {
        chatId = newChat.id
      }
    }

    // Get recent chat history for context (before adding the new message)
    let chatHistory: any[] = []
    if (chatId) {
      const { data: messages } = await supabase
        .from('messages')
        .select('role, content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(10)

      if (messages) {
        chatHistory = messages
      }
    }

    // 🔍 RAG: Search for relevant context from knowledge base
    let knowledgeContext = ''
    try {
      // Generate embedding for the user's message
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
      })
      const queryEmbedding = embeddingResponse.data[0].embedding

      // Search for similar content in knowledge base
      const { data: similarContent, error: searchError } = await supabase.rpc(
        'search_knowledge',
        {
          query_embedding: queryEmbedding,
          bot_uuid: botId,
          match_threshold: 0.3, // Lower threshold = more results
          match_count: 5,
        }
      )

      if (searchError) {
        console.error('Knowledge search error:', searchError)
      } else if (similarContent && similarContent.length > 0) {
        knowledgeContext = similarContent
          .map((chunk: any) => chunk.content_text)
          .join('\n\n')
        
        console.log(`📚 Retrieved ${similarContent.length} context chunks for query: "${message.substring(0, 50)}..."`)
        console.log(`✅ Context preview: ${knowledgeContext.substring(0, 200)}...`)
      } else {
        console.log('⚠️  No relevant context found in knowledge base')
      }
    } catch (embeddingError) {
      console.error('Error generating embeddings or searching knowledge:', embeddingError)
    }

    // Build enhanced system message with knowledge base context
    let systemMessage = `You are ${bot.name}, a helpful AI assistant. ${bot.personality}. Respond in ${bot.language === 'he' ? 'Hebrew' : 'English'}.`
    
    if (knowledgeContext) {
      systemMessage += `\n\n📚 Knowledge Base Context:\n${knowledgeContext}\n\nUse this context to answer the user's questions accurately. If the answer is in the context, cite it. If not, use your general knowledge.`
    }
    
    const openaiMessages: any[] = [
      { role: 'system', content: systemMessage },
      ...chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      // Add the current user message
      { role: 'user', content: message },
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: bot.model || 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: bot.temperature || 0.7,
      max_tokens: bot.max_tokens || 500,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Save both user message and assistant message to database
    if (chatId) {
      // Save user message first
      await supabase.from('messages').insert([
        {
          chat_id: chatId,
          role: 'user',
          content: message,
        },
      ])

      // Save assistant message
      await supabase.from('messages').insert([
        {
          chat_id: chatId,
          role: 'assistant',
          content: assistantMessage,
          tokens_used: completion.usage?.total_tokens || 0,
        },
      ])

      // Update chat message count
      await supabase
        .from('chats')
        .update({ message_count: chatHistory.length + 2 })
        .eq('id', chatId)
    }

    return NextResponse.json({
      message: assistantMessage,
      sessionId: sessionId,
      tokensUsed: completion.usage?.total_tokens || 0,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    )
  }
}

