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
    @Body() body: { sessionId: string; message: string; visitorMetadata?: any },
  ) {
    if (!botToken) {
      throw new UnauthorizedException('Bot token required');
    }

    // Verify bot token
    const bot = await this.botsService.findByApiToken(botToken);

    return await this.chatService.getResponse(
      bot.id,
      body.sessionId,
      body.message,
      body.visitorMetadata,
    );
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

