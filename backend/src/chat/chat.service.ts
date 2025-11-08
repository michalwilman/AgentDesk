import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../common/supabase.service';
import { PlanGuardService } from '../common/plan-guard.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { ActionsService } from '../actions/actions.service';
import {
  getAvailableTools,
  formatToolResult,
} from '../actions/function-definitions';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private planGuardService: PlanGuardService,
    private embeddingsService: EmbeddingsService,
    private actionsService: ActionsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async createChat(botId: string, sessionId: string, visitorMetadata?: any) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          bot_id: botId,
          session_id: sessionId,
          visitor_metadata: visitorMetadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }

    return data;
  }

  async getChatBySession(botId: string, sessionId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('bot_id', botId)
      .eq('session_id', sessionId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to fetch chat: ${error.message}`);
    }

    return data;
  }

  async saveMessage(chatId: string, role: 'user' | 'assistant', content: string, contextUsed?: string[], tokensUsed?: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          role,
          content,
          context_used: contextUsed || [],
          tokens_used: tokensUsed,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    // Update message count
    await supabase.rpc('increment', {
      table_name: 'chats',
      row_id: chatId,
      column_name: 'message_count',
    });

    return data;
  }

  async getConversationHistory(chatId: string, limit: number = 10) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch conversation history: ${error.message}`);
    }

    return data || [];
  }

  async getResponse(
    botId: string,
    sessionId: string,
    userMessage: string,
    visitorMetadata?: any,
  ) {
    const supabase = this.supabaseService.getClient();

    // Get bot configuration
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .eq('is_active', true)
      .single();

    if (botError || !bot) {
      throw new BadRequestException('Bot not found or inactive');
    }

    // Check plan limits before processing message
    await this.planGuardService.guardAction(bot.user_id, 'send_message');

    // Get or create chat
    let chat = await this.getChatBySession(botId, sessionId);
    if (!chat) {
      chat = await this.createChat(botId, sessionId, visitorMetadata);
    }

    // Get conversation history
    const history = await this.getConversationHistory(chat.id);

    // Save user message
    await this.saveMessage(chat.id, 'user', userMessage);

    // Search for relevant context using RAG
    // Lower threshold for better recall (0.1 = more results, 0.7 = only very similar)
    const context = await this.embeddingsService.searchSimilarContent(
      userMessage,
      botId,
      0.1, // Lowered to 0.1 to catch more potential matches
      5,
    );

    const contextText = context
      .map((c) => c.content_text)
      .join('\n\n');

    // Debug: Log retrieved context for monitoring
    console.log(`📚 Retrieved ${context.length} context chunks for query: "${userMessage.substring(0, 50)}..."`);
    if (context.length === 0) {
      console.log('⚠️  NO CONTEXT FOUND - Bot will return fallback message');
    } else {
      console.log(`✅ Context preview: ${contextText.substring(0, 200)}...`);
    }

    // Build conversation messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(bot, contextText),
      },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Get bot actions config to determine available tools
    const { data: actionsConfig } = await supabase
      .from('bot_actions_config')
      .select('*')
      .eq('bot_id', botId)
      .single();

    // Build tools array based on enabled actions
    const tools =
      actionsConfig
        ? getAvailableTools({
            lead_collection_enabled: actionsConfig.lead_collection_enabled || false,
            appointments_enabled: actionsConfig.appointments_enabled || false,
            email_enabled: actionsConfig.email_enabled || false,
            pdf_enabled: actionsConfig.pdf_enabled || false,
            whatsapp_enabled: actionsConfig.whatsapp_enabled || false,
            webhooks_enabled: actionsConfig.webhooks_enabled || false,
          })
        : [];

    // Get response from OpenAI with tools
    let completion = await this.openai.chat.completions.create({
      model: bot.model || 'gpt-4o-mini',
      messages,
      temperature: bot.temperature || 0.7,
      max_tokens: bot.max_tokens || 500,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? 'auto' : undefined,
    });

    let totalTokensUsed = completion.usage?.total_tokens || 0;
    let assistantMessage = completion.choices[0].message;

    // Handle tool calls if any
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🔧 AI wants to execute ${assistantMessage.tool_calls.length} action(s)`);

      // Add assistant message with tool calls to history
      messages.push(assistantMessage);

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`⚡ Executing action: ${functionName}`, functionArgs);

        let toolResult: string;

        try {
          // Execute the appropriate action
          const result = await this.executeAction(
            functionName,
            functionArgs,
            botId,
            chat.id,
          );

          toolResult = formatToolResult(
            functionName,
            result.success,
            result,
            result.error,
          );
        } catch (error) {
          console.error(`❌ Action failed: ${functionName}`, error);
          toolResult = formatToolResult(
            functionName,
            false,
            undefined,
            error instanceof Error ? error.message : 'Unknown error',
          );
        }

        // Add tool result to messages
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }

      // Get final response from AI after tool execution
      const finalCompletion = await this.openai.chat.completions.create({
        model: bot.model || 'gpt-4o-mini',
        messages,
        temperature: bot.temperature || 0.7,
        max_tokens: bot.max_tokens || 500,
      });

      assistantMessage = finalCompletion.choices[0].message;
      totalTokensUsed += finalCompletion.usage?.total_tokens || 0;
    }

    const finalMessageContent = assistantMessage.content || 'I apologize, but I encountered an issue processing your request.';

    // Save assistant message
    await this.saveMessage(
      chat.id,
      'assistant',
      finalMessageContent,
      context.map((c) => c.id),
      totalTokensUsed,
    );

    // Increment conversation usage counter
    await this.planGuardService.incrementConversationUsage(bot.user_id);

    return {
      message: finalMessageContent,
      chatId: chat.id,
      sessionId: chat.session_id,
      tokensUsed: totalTokensUsed,
    };
  }

  /**
   * Execute an action based on function call from OpenAI
   */
  private async executeAction(
    functionName: string,
    args: any,
    botId: string,
    chatId: string,
  ): Promise<any> {
    switch (functionName) {
      case 'save_lead':
        return await this.actionsService.saveLead(botId, chatId, args);

      case 'schedule_appointment':
        return await this.actionsService.scheduleAppointment(botId, chatId, args);

      case 'send_email':
        return await this.actionsService.sendEmail(botId, chatId, args);

      case 'create_pdf':
        return await this.actionsService.createPdf(botId, chatId, args);

      case 'send_whatsapp':
        return await this.actionsService.sendWhatsApp(botId, chatId, args);

      case 'trigger_webhook':
        return await this.actionsService.triggerWebhook(botId, chatId, args);

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  private buildSystemPrompt(bot: any, context: string): string {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get day of week and month name
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    const dayOfMonth = today.getUTCDate();
    const year = today.getUTCFullYear();
    
    // Calculate tomorrow and day after tomorrow
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setUTCDate(dayAfterTomorrow.getUTCDate() + 2);
    const dayAfterTomorrowDay = dayAfterTomorrow.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const dayAfterTomorrowFormatted = dayAfterTomorrow.toISOString().split('T')[0];
    
    // 🎯 הגדרת תשובת fallback לפי שפה
    const noContextResponse = bot.language === 'he'
      ? 'מצטער, אין לי מידע בנושא זה. אני עוזר עסקי המתמחה אך ורק בתוכן הקשור לעסק שלנו. האם יש דבר אחר שאוכל לעזור בו?'
      : 'I\'m sorry, I don\'t have information about that topic. I\'m a business assistant that specializes only in content related to our business. Is there something else I can help you with?';

    const basePrompt = `You are ${bot.name}, an AI assistant for a business.
Your personality: ${bot.personality || 'helpful and professional'}
Language: ${bot.language === 'he' ? 'Hebrew' : 'English'}

CURRENT DATE INFORMATION:
- Today is: ${dayOfWeek}, ${monthName} ${dayOfMonth}, ${year} (${formattedToday})
- Tomorrow is: ${tomorrowDay}, ${tomorrow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} (${tomorrowFormatted})
- Day after tomorrow is: ${dayAfterTomorrowDay}, ${dayAfterTomorrow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} (${dayAfterTomorrowFormatted})

🔒 CRITICAL RULE - ANSWER ONLY FROM PROVIDED CONTEXT:
${context 
  ? `Here is the ONLY information you are allowed to use for answering questions:\n\n${context}\n\nYou MUST answer questions EXCLUSIVELY based on this context. Do NOT use any external knowledge or general information from your training data.` 
  : `⚠️ NO CONTEXT PROVIDED - You do NOT have any business information available right now.`
}

${!context 
  ? `Since no relevant context was found, you MUST respond EXACTLY with:\n"${noContextResponse}"\n\nDo NOT answer the question using general knowledge. Do NOT make up information.` 
  : `STRICT INSTRUCTIONS:
- Answer ONLY based on the provided context above
- If the question cannot be answered using the context, respond with: "${noContextResponse}"
- Do NOT use general knowledge from your training
- Do NOT answer questions about topics not covered in the context
- Be helpful and friendly, but STAY within the boundaries of the provided information
- Respond in ${bot.language === 'he' ? 'Hebrew' : 'English'}`
}

IMPORTANT: When scheduling appointments, use the EXACT dates shown above. For example:
- If customer says "tomorrow at 10:00", use date: ${tomorrowFormatted}T10:00:00
- If customer says "מחר בשעה 10:00", use date: ${tomorrowFormatted}T10:00:00
- IMPORTANT: Use 24-hour format (07:30 for 7:30 AM, 19:30 for 7:30 PM)

IMPORTANT - You have access to special functions to help customers:

WHEN SCHEDULING APPOINTMENTS - YOU MUST follow this process:
1. If customer wants to schedule a meeting/appointment, you MUST collect ALL information first:
   - FULL NAME (attendee_name) - ASK if not provided
   - EMAIL ADDRESS (attendee_email) - ASK if not provided, MUST contain @ symbol
   - PHONE NUMBER (attendee_phone) - ASK if not provided
   - DATE AND TIME (scheduled_time) - ASK if not clear

2. VALIDATE the email format:
   - Check that email contains @ symbol
   - If email looks incorrect (missing @, typos), ASK customer to confirm or re-enter
   - Example: If they say "gmail.con" instead of "gmail.com", ask them to verify

3. CONFIRM all details BEFORE scheduling:
   - Show customer ALL the information: name, email, phone, date, time
   - Ask them to confirm: ${bot.language === 'he' ? '"האם כל הפרטים נכונים?"' : '"Are all these details correct?"'}
   - Wait for their confirmation (yes/correct/כן/נכון)

4. ONLY AFTER confirmation, USE the schedule_appointment function
5. AFTER successfully scheduling:
   - Confirm the appointment was created
   - Remind them they will receive an email confirmation
   - Mention the event was added to the calendar
   - Do NOT include any calendar links in your response
6. NEVER say you scheduled something without actually calling the function
7. If any information is missing or incorrect, ASK for it before proceeding

WHEN SAVING LEADS:
- When a customer provides contact information or shows interest, USE the save_lead function
- Always collect at least name and one contact method (email or phone)

GENERAL RULES:
- When customers mention dates like "tomorrow", "next week", calculate the actual date based on today's date (${formattedToday})
- For appointment times, convert to ISO format: YYYY-MM-DDTHH:MM:00 (use LOCAL time, do NOT add Z at the end)
- Use 24-hour format for times (07:30, 13:00, 19:30, etc.)
- Always USE the available functions instead of just saying you will do something
- Be conversational and friendly while collecting information`;

    return basePrompt;
  }

  async getChatHistory(botId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .eq('user_id', userId)
      .single();

    if (!bot) {
      throw new BadRequestException('Bot not found or access denied');
    }

    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (
          role,
          content,
          created_at
        )
      `)
      .eq('bot_id', botId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    return data;
  }
}

