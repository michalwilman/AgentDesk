import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ChatModule } from '../chat/chat.module';
import { SupabaseService } from '../common/supabase.service';

@Module({
  imports: [ChatModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, SupabaseService],
  exports: [WebhooksService],
})
export class WebhooksModule {}

