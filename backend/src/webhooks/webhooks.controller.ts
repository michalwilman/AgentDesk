import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { TelegramUpdateDto } from './dto/telegram-webhook.dto';
import { WhatsAppWebhookDto } from './dto/whatsapp-webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('telegram')
  @HttpCode(200)
  async handleTelegram(@Body() update: TelegramUpdateDto) {
    this.logger.log('Received Telegram webhook');
    return this.webhooksService.handleTelegramWebhook(update);
  }

  @Post('whatsapp')
  @HttpCode(200)
  async handleWhatsApp(@Body() payload: WhatsAppWebhookDto) {
    this.logger.log('Received WhatsApp webhook');
    return this.webhooksService.handleWhatsAppWebhook(payload);
  }
}

