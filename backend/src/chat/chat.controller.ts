import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { BotsService } from '../bots/bots.service';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private botsService: BotsService,
  ) {}

  @Post('message')
  async sendMessage(
    @Headers('x-bot-token') botToken: string,
    @Headers('origin') origin: string,
    @Headers('referer') referer: string,
    @Body() body: { sessionId: string; message: string; visitorMetadata?: any },
  ) {
    if (!botToken) {
      throw new UnauthorizedException('Bot token required');
    }

    // Verify bot token
    const bot = await this.botsService.findByApiToken(botToken);

    // Domain validation - check if request comes from allowed domain
    if (bot.allowed_domains && bot.allowed_domains.length > 0) {
      const requestDomain = this.extractDomain(origin || referer);
      
      // Debug logging
      console.log(`🔒 Domain validation: origin=${origin}, referer=${referer}, extracted=${requestDomain}, allowed=${bot.allowed_domains}`);
      
      const isAllowed = bot.allowed_domains.some((domain: string) => 
        requestDomain.includes(domain) || domain === '*'
      );

      if (!isAllowed) {
        console.error(`❌ Domain ${requestDomain} is NOT authorized. Allowed: ${bot.allowed_domains}`);
        throw new UnauthorizedException(
          `Domain ${requestDomain} is not authorized to use this bot`
        );
      }
      
      console.log(`✅ Domain ${requestDomain} is authorized`);
    }

    return await this.chatService.getResponse(
      bot.id,
      body.sessionId,
      body.message,
      body.visitorMetadata,
    );
  }

  private extractDomain(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  @Get('history/:botId/:sessionId')
  async getChatHistory(
    @Headers('x-bot-token') botToken: string,
    @Param('botId') botId: string,
    @Param('sessionId') sessionId: string,
  ) {
    if (!botToken) {
      throw new UnauthorizedException('Bot token required');
    }

    // Verify bot token
    const bot = await this.botsService.findByApiToken(botToken);

    if (bot.id !== botId) {
      throw new UnauthorizedException('Invalid bot token for this bot');
    }

    const chat = await this.chatService.getChatBySession(botId, sessionId);
    
    if (!chat) {
      return { messages: [] };
    }

    const messages = await this.chatService.getConversationHistory(chat.id);
    
    return {
      chatId: chat.id,
      sessionId: chat.session_id,
      messages,
    };
  }
}

