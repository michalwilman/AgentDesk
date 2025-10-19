import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as twilio from 'twilio';
import { SupabaseService } from '../common/supabase.service';
import { ChatService } from '../chat/chat.service';
import { TelegramUpdateDto } from './dto/telegram-webhook.dto';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private supabaseService: SupabaseService,
    private chatService: ChatService,
    private configService: ConfigService,
  ) {}

  async handleTelegramWebhook(update: TelegramUpdateDto) {
    try {
      // Extract message data
      if (!update.message || !update.message.text) {
        this.logger.warn('Received Telegram update without text message');
        return { ok: true };
      }

      const message = update.message;
      const chatId = message.chat.id;
      const userMessage = message.text;
      const username = message.from.username || message.from.first_name;

      this.logger.log(`Received Telegram message from chat ${chatId}: ${userMessage}`);

      // We need to identify which bot this is for
      // Since Telegram doesn't send the bot token, we'll need to set it up differently
      // For now, we'll extract it from the webhook URL or request headers
      // This is a limitation - we'll need the token passed somehow

      // Find bot by checking all bots with telegram_token set
      // and verify the webhook is valid by attempting to get bot info
      const supabase = this.supabaseService.getClient();
      
      const { data: bots, error } = await supabase
        .from('bots')
        .select('*')
        .not('telegram_token', 'is', null)
        .eq('is_active', true);

      if (error || !bots || bots.length === 0) {
        this.logger.warn('No active bots with Telegram configured');
        return { ok: true };
      }

      // Try to match the bot (in production, this should be more efficient)
      // For now, we'll use the first bot or implement a better matching mechanism
      let targetBot = null;
      
      // Better approach: check if we can extract bot info from the update
      // or implement a routing mechanism based on the webhook URL path
      for (const bot of bots) {
        try {
          // Verify this bot token is valid by making a quick API call
          const botInfo = await this.getTelegramBotInfo(bot.telegram_token);
          if (botInfo) {
            targetBot = bot;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!targetBot) {
        this.logger.error('Could not identify target bot for Telegram message');
        return { ok: true };
      }

      // Create session ID from chat ID
      const sessionId = `telegram_${chatId}`;

      // Process message through chat service
      const response = await this.chatService.getResponse(
        targetBot.id,
        sessionId,
        userMessage,
        {
          platform: 'telegram',
          chatId: chatId,
          username: username,
        },
      );

      // Send response back to Telegram
      await this.sendTelegramMessage(
        targetBot.telegram_token,
        chatId,
        response.message,
      );

      return { ok: true };
    } catch (error) {
      this.logger.error('Error processing Telegram webhook:', error);
      throw error;
    }
  }

  async handleWhatsAppWebhook(payload: WhatsAppWebhookDto) {
    try {
      const { AccountSid, From, Body } = payload;

      if (!Body) {
        this.logger.warn('Received WhatsApp message without body');
        return { success: true };
      }

      // Remove 'whatsapp:' prefix from phone number
      const phoneNumber = From.replace('whatsapp:', '');

      this.logger.log(`Received WhatsApp message from ${phoneNumber}: ${Body}`);

      // Find bot by Account SID
      const supabase = this.supabaseService.getClient();

      const { data: bot, error } = await supabase
        .from('bots')
        .select('*')
        .eq('whatsapp_sid', AccountSid)
        .eq('is_active', true)
        .single();

      if (error || !bot) {
        this.logger.error(`No active bot found for WhatsApp SID: ${AccountSid}`);
        throw new NotFoundException('Bot not found for this WhatsApp account');
      }

      // Create session ID from phone number
      const sessionId = `whatsapp_${phoneNumber}`;

      // Process message through chat service
      const response = await this.chatService.getResponse(
        bot.id,
        sessionId,
        Body,
        {
          platform: 'whatsapp',
          phoneNumber: phoneNumber,
        },
      );

      // Send response back via Twilio
      await this.sendWhatsAppMessage(
        bot.whatsapp_sid,
        bot.whatsapp_auth_token,
        bot.whatsapp_phone_number,
        From,
        response.message,
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error processing WhatsApp webhook:', error);
      throw error;
    }
  }

  private async getTelegramBotInfo(token: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${token}/getMe`,
      );
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to get Telegram bot info: ${error.message}`);
      throw error;
    }
  }

  private async sendTelegramMessage(
    token: string,
    chatId: number,
    text: string,
  ): Promise<void> {
    try {
      await axios.post(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        },
      );
      this.logger.log(`Sent Telegram message to chat ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send Telegram message: ${error.message}`);
      throw error;
    }
  }

  private async sendWhatsAppMessage(
    accountSid: string,
    authToken: string,
    from: string,
    to: string,
    body: string,
  ): Promise<void> {
    try {
      const client = twilio(accountSid, authToken);

      await client.messages.create({
        from: `whatsapp:${from}`,
        to: to,
        body: body,
      });

      this.logger.log(`Sent WhatsApp message to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
      throw error;
    }
  }

  // Helper method to set up Telegram webhook
  async setupTelegramWebhook(botToken: string, webhookUrl: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          url: webhookUrl,
          allowed_updates: ['message'],
        },
      );
      
      return response.data.ok;
    } catch (error) {
      this.logger.error(`Failed to set up Telegram webhook: ${error.message}`);
      return false;
    }
  }
}

