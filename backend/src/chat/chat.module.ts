import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SupabaseService } from '../common/supabase.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { BotsService } from '../bots/bots.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, SupabaseService, EmbeddingsService, BotsService],
  exports: [ChatService],
})
export class ChatModule {}

